"use strict"

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET

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
    throw {status: 400, message: e.message};
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

const findCustomer = async (email) => {
  return stripe.customers.search({
    query: `email: '${email}'`,
  });
}

const createCustomer = async (email, name) => {
  return stripe.customers.create({
    email,
    name
  });
}

const findProduct = async (name) => {
  return stripe.products.search({
    query: `name: '${name}'`,
  });
}

const createProduct = async (name, description, price, interval = "month", interval_count = 1) => {
  return stripe.products.create({
    name: name,
    description: description,
    default_price_data: {
      currency: 'cad',
      unit_amount: parseFloat(price) * 100,
      recurring: {
        interval,
        interval_count
      }
    }
  });
}

class StripeProcessor {
  async createPaymentIntent(amountInCents, orderDescription, data) {
    try {
      let result = data.email
        ? await this.getOrCreateCustomer(data.email, data.name)
        : null;

      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amountInCents),
        currency: "cad",
        description: orderDescription,
        customer: result.success ? result.customer.id : null,
        metadata: data
      });
      return {success: true, intent}
    } catch (e) {
      console.error(e)
      return {success: false, message: e.message};
    }
  }

  async checkout(order) {
    const paymentIntentResult = await this.createPaymentIntent(
      order.total_amount_after_tax * 100,
      order.details, {
        items: JSON.stringify(order.order_items),
        email: order.email,
        name: order.name
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
    return chargePaymentIntent(intentId);
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
        return cancelPaymentIntent(intentId);
      } else {
        return {success: false, message: `Order cannot be canceled when in status: ${intent.status}`}
      }
    } catch (e) {
      console.error(e);
      return {success: false, message: e.message};
    }
  }

  async getOrCreateCustomer(email, name) {
    try {
      let customer = await findCustomer(email);
      if (customer.data.length === 0) {
        customer = await createCustomer(email, name);
      }
      return {success: true, customer: customer.data[0]};
    } catch (e) {
      console.error(e);
      return {success: false, message: e.message};
    }
  }

  async verifyEvent(req) {
    try {
      const signature = req.headers['stripe-signature']
      const event = await stripe.webhooks.constructEvent(req.body, signature, endpointSecret)
      return {success: true, event}
    } catch (e) {
      console.error(e);
      return {success: false};
    }
  }

  async getOrCreateProduct(name, description, price) {
    try {
      let product;
      const results = await findProduct(name);

      if (results.data.length === 0) {
        product = await createProduct(name, description, price);
      } else {
        product = results.data[0];
      }

      return {success: true, product};
    } catch (e) {
      console.error(e);
      return {success: false, message: e.message};
    }
  }

  async getCharge(id) {
    try {
      const charge = await stripe.charges.retrieve(id);
      return {success: true, charge};
    } catch (e) {
      console.error(e);
      return {success: false, message: e.message};
    }
  }

  async createSubscription(name, email, data) {
    try {
      const {product} = await this.getOrCreateProduct(name, data.description, data.price);
      const {customer} = await this.getOrCreateCustomer(email, data.user_name);
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        payment_behavior: 'default_incomplete',
        metadata: {email},
        expand: ['latest_invoice.payment_intent'],
        // TODO: Add support for trialing
        // trial_period_days: data.trial_period,
        items: [
          {price: product.default_price},
        ],
      });
      return {success: true, subscription};
    } catch (e) {
      console.error(e);
      return {success: false, message: e.message};
    }
  }

  async getCustomerSubscriptions(email) {
    try {
      const result = await stripe.subscriptions.search({
        query: `metadata["email"]:'${email}'`,
        expand: ['data.latest_invoice.payment_intent']
      });
      return {success: true, subscriptions: result.data};
    } catch (e) {
      console.error(e);
      return {success: false, message: e.message};
    }
  }
}

module.exports = StripeProcessor;