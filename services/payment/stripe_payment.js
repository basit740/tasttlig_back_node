"use strict";

const { Stripe } = require("stripe");

// Use Stripe secret key
const keySecret = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(keySecret);

const paymentIntent = async (order_details) => {
  try {
    const total_amount_before_tax = parseFloat(order_details.item.price);
    const total_tax = Math.round(total_amount_before_tax * 13)/100;
    const payment = await stripe.paymentIntents.create({
      amount: Math.round((total_amount_before_tax + total_tax) * 100),
      currency: "cad",
      description: order_details.item.description
    });
    return {success: true, client_secret: payment.client_secret};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

module.exports = {
  paymentIntent
}