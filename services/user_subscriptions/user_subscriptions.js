const StripeProcessor = require("../payment/processors/stripe/stripe_processor");
const {UserSubscriptions, Subscriptions} = require("../../models");

async function getUserSubscriptions(user) {
  const result = await new StripeProcessor().getCustomerSubscriptions(user.email);
  const user_subscriptions = await UserSubscriptions
    .query()
    .withGraphFetched("[subscription]")
    .where({
      user_id: user.id
    })
  if (result.success) {
    const grouped = result.subscriptions
      .reduce((acc, sub) => ({...acc, [sub.id]: sub}), {})
    const subscriptions = [];
    for (const sub of user_subscriptions) {
      const str = grouped[sub.reference_id];
      if (str) {
        subscriptions.push({
          ...sub, intent: {
            id: str.latest_invoice.payment_intent.id,
            amount: str.latest_invoice.payment_intent.amount,
            client_secret: str.latest_invoice.payment_intent.client_secret,
            description: str.latest_invoice.payment_intent.description,
            status: str.latest_invoice.payment_intent.status,
          }
        })
      } else {
        console.warn(
          `Data inconsistency detected. Could not find Stripe subscription for UserSubscription with id: ${sub.user_subscription_id}`)
      }
    }

    return {
      success: true,
      subscriptions
    }
  }

  return result;
}

const createUserSubscription = async (subscriptionCode, user) => {
  const subscription = await Subscriptions
    .query()
    .findOne({subscription_code: subscriptionCode})

  if (!subscription) {
    throw {status: 404, message: `Subscription with code ${subscriptionCode} was not found`}
  }

  if ((await UserSubscriptions.query().where({
    user_id: user.id,
    subscription_code: subscriptionCode
  }).whereNotIn(
    "user_subscription_status", [
      UserSubscriptions.Status.Canceled,
      UserSubscriptions.Status.IncompleteExpired]
  ).resultSize()) > 0) {
    throw {status: 409, message: `User already has subscription`}
  }

  const result = await new StripeProcessor().createSubscription(subscriptionCode, user.email, {
    ...subscription,
    user_name: `${user.first_name} ${user.last_name}`
  });

  if (result.success) {
    const intent = result.subscription.latest_invoice.payment_intent;

    await UserSubscriptions.query().insert({
      user_id: user.id,
      subscription_code: subscriptionCode,
      user_subscription_status: UserSubscriptions.Status.Incomplete,
      reference_id: result.subscription.id
    });

    return {
      success: true,
      subscriptionId: result.subscription.id,
      intent: {
        id: intent.id,
        amount: intent.amount,
        client_secret: intent.client_secret,
        description: intent.description,
        status: intent.status
      }
    }
  }

  return result;
}

const cancelUserSubscription = async (id, userId) => {
  const userSubscription = await UserSubscriptions.query().findOne({
    user_subscription_id: id,
    user_id: userId
  });

  if (!userSubscription) {
    throw {status: 404, message: "User subscription not found"};
  }

  return new StripeProcessor()
    .cancelSubscription(userSubscription.reference_id);
}

module.exports = {
  getUserSubscriptions,
  createUserSubscription,
  cancelUserSubscription
}