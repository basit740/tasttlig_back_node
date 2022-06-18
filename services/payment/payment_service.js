const {createOrder} = require("../order/order_service");
const StripeProcessor = require("./processors/stripe/stripe_processor");
const {Orders, Subscriptions, UserSubscriptions, Payments, UserRoles, Roles} = require("../../models");
const {nodemailer_transporter: Mailer} = require("../email/nodemailer");
const {retrieveOrderItem} = require("../order/order_item_retriever");
const moment = require("moment");

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
  const festivalOrderItem = order.getFestivalOrderItem();
  const result = festivalOrderItem
    ? await retrieveOrderItem(festivalOrderItem.item_type, festivalOrderItem.item_id)
    : null;

  let festival = null, duration = null;

  if (result) {
    festival = result.item;
    const now = moment(new Date());
    const festivalDate = moment(festival.festival_start_date);
    duration = moment.duration(festivalDate.diff(now));
  }

  await Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: order.email,
    subject: "Purchase Successful",
    template: "order/order_complete",
    context: {
      order,
      orderDate: moment(order.order_datetime).format("MM/DD/YY @ hh:mmA"),
      durationDays: duration?.days(),
      durationHours: duration?.hours(),
      durationMinutes: duration?.minutes(),
      durationSeconds: duration?.seconds(),
      festival,
      first_name: order.user.first_name,
      layout: 'main-no-container',
      siteBase: process.env.SITE_BASE
    },
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

const completeOrderById = async (orderId) => {
  const order = await Orders.query().findById(orderId);

  if (!order) {
    throw {status: 404, message: 'Order not found'};
  }

  if (order.status === Orders.Status.Canceled) {
    throw {status: 400, message: `Order is in an invalid status: ${order.status}`};
  }

  if (order.status === Orders.Status.Complete) {
    return {success: true};
  }

  const {intent} = await new StripeProcessor().getPaymentIntent(order.reference_id);
  return completeOrder(intent);
}

const completeOrder = async (intent) => {
  return Orders.transaction(async (trx) => {
    await trx.raw('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const order = await Orders
      .query(trx)
      .findOne({reference_id: intent.id})
      .withGraphFetched("[order_items, user]");

    if (order && order.status === Orders.Status.Pending) {
      const {success, charge} = await new StripeProcessor().getCharge(intent.charges.data[0].id);
      if (success && charge.paid) {
        await Payments.query(trx).insert({
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

      await order.$query(trx).update({status: Orders.Status.Complete});
      await sendOrderCompleteEmail(order);
      throw {status: 400, message: 'ww'};
      return {success: true}
    }

    return {success: false};
  })
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

const updateUserSubscription = async (data) => {
  const subscription = await UserSubscriptions
    .query().findOne({reference_id: data.id})
    .withGraphFetched("[user]");
  if (!subscription) {
    return {success: false}
  }

  const oldStatus = subscription.user_subscription_status;
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
  const user_id = subscription.user.tasttlig_user_id;

  await UserRoles.query()
    .delete()
    .where({user_id});

  let role = subscription.subscription_code.startsWith("M")
    ? Roles.Type.Member
    : (subscription.subscription_code.startsWith("B")
      ? Roles.Type.Business_Member
      : Roles.Type.Guest);

  await UserRoles.query().insert({
    user_id,
    role_code: role
  });

  await sendSubscriptionActivatedEmail(subscription);
}

const cancelSubscription = async (subscription) => {
  const user_id = subscription.user.tasttlig_user_id;

  await UserRoles.query()
    .delete()
    .where({user_id});

  await UserRoles.query().insert({
    user_id,
    role_code: Roles.Type.Guest
  });

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

  console.log(`Processing webhook event: ${JSON.stringify({
    type: event.type,
    id: event.id,
    objectType: event.data.object.object,
    objectId: event.data.object.id,
  })}`);

  let result = null;

  switch (event.type) {
    case 'payment_intent.succeeded':
      result = await completeOrder(event.data.object);
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      result = await updateUserSubscription(event.data.object);
      break;
    case 'invoice.paid':
      result = captureSubscriptionPayment(event.data.object);
      break;
    default:
      console.info(`Webhook event of type ${event.type} is not supported`);
      result = {success: true}
      break;
  }

  console.log(`Finished processing webhook event: ${event.id} with response ${JSON.stringify(result)}`);
  return result;
}

module.exports = {
  checkout,
  charge,
  chargeIntent,
  completeOrder,
  completeOrderById,
  cancelOrder,
  processWebhook
}