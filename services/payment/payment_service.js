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
      .update({intent_id: result.intent.id, status: Orders.Status.Pending});
  }
  return result;
}

const charge = async (orderId) => {
  const order = await getOrder(orderId);
  const result = await new StripeProcessor().charge(order.intent_id);
  order.$query().update({status: Orders.Status.Paid});
  return result;
}

const completeOrder = async (orderId) => {
  const order = await getOrder(orderId);

  if (order.status !== Orders.Status.Pending) {
    throw {status: 400, message: "Order is in an invalid state"}
  }

  const result = await new StripeProcessor().complete(order.intent_id);
  const intent = result.intent;

  if (intent.status === "succeeded") {
    await order.$query().update({status: Orders.Status.Complete});
    await sendOrderCompleteEmail(order);
    return result;
  }

  if (intent.status === "canceled") {
    await order.$query().update({status: Orders.Status.Canceled});
    throw {status: 400, message: "Order has been canceled"}
  }

  throw {status: 400, message: `Order is in a pending status: ${intent.status}`}
}

const cancelOrder = async (orderId) => {
  try {
    const order = await getOrder(orderId);
    const result = await new StripeProcessor().cancel(order.intent_id);
    if (result.success) {
      await order.$query().update({status: Orders.Status.Canceled});
    }
    return result;
  } catch (e) {
    console.error(e);
    return {success: false, message: e.message};
  }
}

module.exports = {
  checkout,
  charge,
  completeOrder,
  cancelOrder
}