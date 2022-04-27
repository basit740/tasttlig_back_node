"use strict"

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amountInCents, orderDescription, metadata) => {
  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amountInCents),
      currency: "cad",
      description: orderDescription,
      metadata
    });

    return {success: true, intent}
  } catch (e) {
    console.error(e)
    return {success: false, message: e.message};
  }
}

const getPaymentIntent = async (intentId) => {
  try {
    const intent = await stripe.paymentIntents.retrieve(
      intentId
    );
    return {success: true, intent}
  } catch (e) {
    console.error(e)
    return {success: false, message: e.message};
  }
}

const chargePaymentIntent = async (intentId, paymentMethod = 'pm_card_visa') => {
  try {
    const intent = await stripe.paymentIntents.confirm(
      intentId,
      {payment_method: paymentMethod}
    );
    return {success: true, intent}
  } catch (e) {
    console.error(e);
    return {success: false, message: e.message};
  }
}

const cancelPaymentIntent = async (intentId) => {
  try {
    const intent = await stripe.paymentIntents.cancel(
      intentId
    );
    return {success: true, intent}
  } catch (e) {
    console.error(e);
    return {success: false, message: e.message};
  }
}

class StripeProcessor {
  async checkout(order) {
    const paymentIntentResult = await createPaymentIntent(
      order.total_amount_after_tax * 100,
      order.details, {
        items: JSON.stringify(order.order_items)
      });

    if (paymentIntentResult.success) {
      const {
        intent: {
          id,
          amount,
          client_secret,
          description,
          status
        }
      } = paymentIntentResult;
      return {success: true, intent: {id, amount, client_secret, description, status}, order}
    } else {
      return paymentIntentResult;
    }
  }

  async charge(intentId) {
    try {
      return chargePaymentIntent(intentId);
    } catch (e) {
      console.error(e);
      return {success: false, message: e.message};
    }
  }

  async complete(intentId) {
    try {
      const {intent} = await getPaymentIntent(intentId);
      return {success: true, intent};
    } catch (e) {
      console.error(e);
      return {success: false, message: e.message};
    }
  }

  async cancel(intentId) {
    try {
      const {intent} = await getPaymentIntent(intentId);
      if (intent.status !== "succeeded" && intent.status !== "canceled") {
        const result = await cancelPaymentIntent(intentId);
        return {success: true, result};
      } else {
        return {success: false, message: `Order cannot be canceled when in status: ${intent.status}`}
      }
    } catch (e) {
      console.error(e);
      return {success: false, message: e.message};
    }
  }
}

module.exports = StripeProcessor;