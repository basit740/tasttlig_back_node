const {createOrder} = require("../order/order_service");
const StripeProcessor = require("./processors/stripe/stripe_processor");
const {Orders, Subscriptions, UserSubscriptions, Payments} = require("../../models");
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

const chargeIntent = async (intentId) => {
  return await new StripeProcessor().charge(intentId);
}

const completeOrder = async (intent) => {
  const order = await Orders
    .query()
    .findOne({reference_id: intent.id})
    .withGraphFetched("[order_items, user]");

  if (order && order.status === Orders.Status.Pending) {
    const {success, charge} = await new StripeProcessor().getCharge(intent.charges[0]);
    if (success && charge.paid) {
      await Payments.query().insert({
        order_id: order.order_id,
        reference_id: charge.id,
        amount: charge.amount_captured / 100,
        vendor: 'stripe',
        used: true,
        payment_method: charge.payment_method_details
          ? charge.payment_method_details.type
          : 'n/a',
      });
    }

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
    user_id: user.id,
    subscription_code: subscriptionCode,
    user_subscription_status: UserSubscriptions.Status.Active
  }).resultSize()) > 0) {
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
  // TODO: Add logic to update roles
  await sendSubscriptionActivatedEmail(subscription);
}

const cancelSubscription = async (subscription) => {
  // TODO: Add logic to update roles
  await sendSubscriptionCancelledEmail(subscription);
}

const captureSubscriptionPayment = async (invoice) => {
  const subscription = await UserSubscriptions
    .query().findOne({reference_id: invoice.subscription})
  if (!subscription) {
    return {success: false};
  }

  const {success, charge} = await new StripeProcessor().getCharge(invoice.charge);
  if (success && charge.paid) {
    await Payments.query().insert({
      user_subscription_id: subscription.user_subscription_id,
      reference_id: charge.id,
      amount: charge.amount_captured / 100,
      vendor: 'stripe',
      used: true,
      payment_method: charge.payment_method_details
        ? charge.payment_method_details.type
        : 'n/a',
    });
  }

  return {success: true};
}

const processWebhook = async (req) => {
  const {success, event} = await new StripeProcessor().verifyEvent(req);
  if (!success) return {success: false}

  console.log(`Processing webhook event: ${JSON.stringify(event)}`);

  switch (event.type) {
    case 'payment_intent.succeeded':
      return await completeOrder(event.data.object)
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return await updateUserSubscription(event.data.object);
    case 'invoice.paid':
      return captureSubscriptionPayment(event.data.object);
    default:
      console.info(`Webhook event of type ${event.type} is not supported`);
      return {success: true}
  }
}

module.exports = {
  checkout,
  charge,
  chargeIntent,
  completeOrder,
  cancelOrder,
  processWebhook,
  createUserSubscription
}