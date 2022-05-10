const {createOrder} = require("../order/order_service");
const StripeProcessor = require("./processors/stripe/stripe_processor");
const {Orders, Subscriptions, UserSubscriptions} = require("../../models");
const {nodemailer_transporter: Mailer} = require("../email/nodemailer");

async function getOrder(orderId) {
  const order = await Orders
    .query()
    .findById(orderId)
    .withGraphFetched("[order_items, user]");
  if (!order) {
    throw {status: 404, message: "Order not found"};
  }
  return order;
}

async function sendOrderCompleteEmail(order) {
  await Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: order.email,
    subject: "[Tasttlig] Purchase Successful",
    template: "order/order_complete",
    context: {order},
  });
}

async function sendSubscriptionActivatedEmail(subscription) {
  await Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: subscription.user.email,
    subject: "[Tasttlig] Subscription Activated",
    template: "subscription/subscription_activated",
    context: {subscription},
  });
}

async function sendSubscriptionCancelledEmail(subscription) {
  await Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: subscription.user.email,
    subject: "[Tasttlig] Subscription Cancelled",
    template: "subscription/subscription_cancelled",
    context: {subscription},
  });
}

const checkout = async (checkoutItems, user = {}) => {
  const order = await createOrder(checkoutItems, user);
  const result = await new StripeProcessor().checkout(order);
  if (result.success) {
    await order
      .$query()
      .update({reference_id: result.intent.id, status: Orders.Status.Pending});
  }
  return result;
}

const charge = async (orderId) => {
  const order = await getOrder(orderId);
  const result = await new StripeProcessor().charge(order.reference_id);
  order.$query().update({status: Orders.Status.Paid});
  return result;
}

const completeOrder = async (referenceId) => {
  const order = await Orders
    .query()
    .findOne({reference_id: referenceId})
    .withGraphFetched("[order_items, user]");

  if (order && order.status === Orders.Status.Pending) {
    await order.$query().update({status: Orders.Status.Complete});
    await sendOrderCompleteEmail(order);
    return {success: true}
  }

  return {success: false};
}

const cancelOrder = async (orderId) => {
  try {
    const order = await getOrder(orderId);
    const result = await new StripeProcessor().cancel(order.reference_id);
    if (result.success) {
      await order.$query().update({status: Orders.Status.Canceled});
    }
    return result;
  } catch (e) {
    console.error(e);
    return {success: false, message: e.message};
  }
}

const createUserSubscription = async (subscriptionCode, user) => {
  const subscription = await Subscriptions
    .query()
    .findOne({subscription_code: subscriptionCode})

  if (!subscription) {
    throw {status: 404, message: `Subscription with code ${subscriptionCode} was not found`}
  }

  if ((await UserSubscriptions.query().where({
    user_id: user.id, subscription_code: subscriptionCode, user_subscription_status: UserSubscriptions.Status.Active
  }).resultSize()) > 0) {
    throw {status: 409, message: `User already has subscription`}
  }

  const result = await new StripeProcessor().createSubscription(subscriptionCode, user.email, {
    ...subscription, user_name: `${user.first_name} ${user.last_name}`
  });

  if (result.success) {
    const order = await createOrder([{
      itemType: 'subscription', itemId: subscription.subscription_id, quantity: 1
    }], user);

    const intent = result.subscription.latest_invoice.payment_intent;
    await order.$query().update({reference_id: intent.id, status: Orders.Status.Pending});

    await UserSubscriptions.query().insert({
      user_id: user.id,
      subscription_code: subscriptionCode,
      user_subscription_status: UserSubscriptions.Status.Incomplete,
      reference_id: result.subscription.id
    });

    return {
      success: true, order, subscriptionId: result.subscription.id, intent: {
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

const updateUserSubscription = async (data) => {
  const subscription = await UserSubscriptions
    .query().findOne({reference_id: data.id})
    .withGraphFetched("[user]");
  if (!subscription) {
    return {success: false}
  }

  const oldStatus = subscription.subscription_status;
  const newStatus = data.status;
  await subscription.$query().update({user_subscription_status: newStatus});

  if (oldStatus === UserSubscriptions.Status.Incomplete &&
    (newStatus === UserSubscriptions.Status.Active || newStatus === UserSubscriptions.Status.Trialing)) {
    await finalizeSubscription(subscription);
  } else if (newStatus === UserSubscriptions.Status.Canceled) {
    await cancelSubscription(subscription);
  }

  return {success: true};
}

const finalizeSubscription = async (subscription) => {
  await sendSubscriptionActivatedEmail(subscription);
  // TODO: Add logic to update roles
}

const cancelSubscription = async (subscription) => {
  await sendSubscriptionCancelledEmail(subscription);
  // TODO: Add logic to update roles
}

const processWebhook = async (req) => {
  const {success, event} = await new StripeProcessor().verifyEvent(req);
  if (!success) return {success: false}

  console.log(`Processing webhook event: ${JSON.stringify(event)}`);

  switch (event.type) {
    case 'payment_intent.succeeded':
      return await completeOrder(event.data.object.id)
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return await updateUserSubscription(event.data.object);
    default:
      console.info(`Webhook event of type ${event.type} is not supported`);
      return {success: true}
  }
}

module.exports = {
  checkout, charge, completeOrder, cancelOrder, processWebhook, createUserSubscription
}