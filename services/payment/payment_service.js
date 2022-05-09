const {createOrder} = require("../order/order_service");
const StripeProcessor = require("./processors/stripe/stripe_processor");
const {Orders} = require("../../models");
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

const processWebhook = async (req) => {
  const {success, event} = await new StripeProcessor().verifyEvent(req);
  if (!success) return {success: false}

  console.log(`Processing webhook event: ${JSON.stringify(event)}`);

  switch (event.type) {
    case 'payment_intent.succeeded':
      return await completeOrder(event.data.object.id)
    default:
      console.info(`Webhook event of type ${event.type} is not supported`);
      return {success: true}
  }
}

module.exports = {
  checkout,
  charge,
  completeOrder,
  cancelOrder,
  processWebhook
}