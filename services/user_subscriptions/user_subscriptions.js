const StripeProcessor = require("../payment/processors/stripe/stripe_processor");
const {UserSubscriptions} = require("../../models");

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

module.exports = {
  getUserSubscriptions
}