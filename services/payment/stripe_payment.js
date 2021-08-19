"use strict";

// Libraries
const { Stripe } = require("stripe");
const { db } = require("../../db/db-config");

// Use Stripe secret key
const keySecret = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(keySecret);

// Stripe payment helper function
const paymentIntent = async (order_details, vendor_festivals, email) => {
  try {
    let total_amount_before_tax = 0;
    if (order_details.item.festival_price) {
      total_amount_before_tax = parseFloat(order_details.item.festival_price);
    } else if (order_details.item.product_price) {
      total_amount_before_tax = parseFloat(order_details.item.product_price);
    } else if (order_details.item.service_price) {
      total_amount_before_tax = parseFloat(order_details.item.service_price);
    } else if (order_details.item.experience_price) {
      total_amount_before_tax = parseFloat(order_details.item.experience_price);
    } else if (vendor_festivals) {
      total_amount_before_tax = parseFloat(
        vendor_festivals.length * order_details.item.price
      );
    } else {
      total_amount_before_tax = parseFloat(order_details.item.price);
    }

    const total_tax = Math.round(total_amount_before_tax * 13) / 100;
    const total_amount_after_tax = total_amount_before_tax + total_tax;
    // const customer = await stripe.customers.create({
    //   email: email
    // });
    // const bankAccount = await stripe.customers.createSource(
    //   customer.id,
    //   {source: {
    //     object: "bank_account",
    //     account_holder_name: 'Jenny Rosen',
    //     account_holder_type: 'individual',
    //     country: "US",
    //     currency: "usd",
    //     account_number: "000123456789",
    //     routing_number: "110000000",
    //   }}
    // );

    const payment = await stripe.paymentIntents.create({
      // customer: customer.id,
      // setup_future_usage: 'off_session',
      amount: Math.round(total_amount_after_tax * 100),
      currency: "cad",
      description: order_details.item.description,
    });

    return {
      success: true,
      // customer: payment.customer,
      client_secret: payment.client_secret,
      paymentIntent_id: payment.id,
      // bankAccount: bankAccount  
    };  
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
};


const createAccountId = async (bank_account_country, bank_account_currency, bank_account_number,
  bank_account_routing_number, bank_account_holder_name,  bank_account_holder_type, user_id, email) => {
  try {
    
    const customer = await stripe.customers.create({
      email: email
    });
    const bankAccount = await stripe.customers.createSource(
      customer.id,
      {source: {
        object: "bank_account",
        account_holder_name: bank_account_holder_name,
        account_holder_type: bank_account_holder_type,
        country: bank_account_country,
        currency: bank_account_currency,
        account_number: bank_account_number,
        routing_number: bank_account_routing_number
      }}

    );

    // const payout = await await stripe.payouts.create({
    //   amount: 1100,
    //   currency: 'cad',
    //   destination: "ba_1JPsZbKiKjECHoUbXixxmQGt"
    // });

    // console.log("12345", payout);


// insert stripe customer id and bank account id into stripe table
      await db.transaction(async (trx) => {
        const response = await trx("stripe")
          .insert({
            user_id: user_id,
            customer_id: customer.id,
            bank_account_id: bankAccount.id
          })
          .returning("*")
          .catch((error) => {
            return { success: false, message: error };
          });
    

      });
    
    return {
      success: false,
 
    };  
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
};



module.exports = {
  paymentIntent,
  createAccountId
};
