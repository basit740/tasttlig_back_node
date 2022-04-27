const {createOrder} = require("../order/order_service");
const StripeProcessor = require("./processors/stripe/stripe_processor");
const {postProcessOrder} = require("../order/order_post_processor");
const {Orders} = require("../../models");

async function getOrder(orderId) {
  const order = await Orders.query().findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
}

const checkout = async (checkoutItems, metadata = {}) => {
  try {
    const order = await createOrder(checkoutItems);
    const result = await new StripeProcessor().checkout(order);
    if (result.success) {
      await order
        .$query()
        .update({intent_id: id, status: Orders.Status.Pending});
    }
    return result;
  } catch (e) {
    console.error(e);
    return {success: false, message: e.message};
  }
}

const charge = async (orderId) => {
  try {
    const order = await getOrder(orderId);
    const result = await new StripeProcessor().charge(order.intent_id);
    if (result.success) {
      order.$query().update({status: Orders.Status.Paid});
    }
    return result;
  } catch (e) {
    console.error(e);
    return {success: false, message: e.message};
  }
}

const completePayment = async (orderId) => {
  try {
    const order = await getOrder(orderId);
    const result = await new StripeProcessor().complete(order.intent_id);
    const intent = result.intent;

    if (intent.status === "succeeded") {
      await order.$query().update({status: Orders.Status.Complete});
      await postProcessOrder(result.order);
      return result;
    } else if (intent.status === "canceled") {
      await order.$query().update({status: Orders.Status.Canceled});
      return {success: false, order, message: "Order has been canceled"}
    } else {
      return {success: false, message: `Order is in a pending status: ${intent.status}`}
    }
  } catch (e) {
    console.error(e);
    return {success: false, message: e.message};
  }
}

const cancelPayment = async (orderId) => {
  try {
    const order = await getOrder(orderId);
    const result = await new StripeProcessor().cancel(orderId);
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
  completePayment,
  cancelPayment
}