"use strict";

// Libraries
const { Stripe } = require("stripe");
const { db } = require("../../db/db-config");

// Use Stripe secret key
const keySecret = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(keySecret);
const stripe_account_service = require("../stripe_accounts/stripe_accounts");

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

    // find the user id that posted the item
    let user_id;
    if (order_details.item.product_user_id) {
      user_id = order_details.item.product_user_id;
    }
    if (order_details.item.service_user_id) {
      user_id = order_details.item.service_user_id;
    }
    if (order_details.item.experience_user_id) {
      user_id = order_details.item.experience_user_id;
    }

    // if user_id exists, get the account id for it
    // and if the account id exists, create a transfer for that account
    if (user_id) {
      stripe_account_service
        .getStripeAccountId(user_id)
        .then(({ account_id }) => {
          if (account_id) {
            console.log("ACCOUNT ID FOR TRANSFER", account_id);
            // business gets 75 percent of payment
            stripe.transfers
              .create({
                amount: Math.round(total_amount_after_tax * 75),
                currency: "cad",
                description: order_details.item.description,
                destination: account_id,
              })
              .then(() => {
                console.log("transfer created");
              })
              .catch((err) => {
                console.log("transfer error", err);
              });
          } else {
            console.log("no commission", account_id);
          }
        });
    }

    return {
      success: true,
      // customer: payment.customer,
      client_secret: payment.client_secret,
      paymentIntent_id: payment.id,
      // bankAccount: bankAccount  
    };  
  } catch (error) {
    console.log("stripe payment error", error);
    return { success: false, message: error.message };
  }
};


const createAccountId = async (bank_account_country, bank_account_currency, bank_account_number,
  bank_account_routing_number, bank_account_holder_name,  bank_account_holder_type, user_id, email) => {
  try {
    
    const customer = await stripe.customers.create({
      email: email
    });
    // const token = await stripe.tokens.create({
    //   card: {
    //     number: '4242424242424242',
    //     exp_month: 8,
    //     exp_year: 2022,
    //     cvc: '314',
    //   },
    // });

    // console.log('1234567token', token);


const card = await stripe.customers.createSource(
  customer.id,
  {source: 'tok_1JS3f8KiKjECHoUbh9Rg9dhO'}
);

// console.log('1234567card', card);
    const payout = await await stripe.payouts.create({
      amount: 1100,
      currency: 'cad',
      destination: "card_1JS3f8KiKjECHoUbxe9AV7I0"
    });



// insert stripe customer id and bank account id into stripe table
      // await db.transaction(async (trx) => {
      //   const response = await trx("stripe")
      //     .insert({
      //       user_id: user_id,
      //       customer_id: customer.id,
      //       // bank_account_id: bankAccount.id
      //     })
      //     .returning("*")
      //     .catch((error) => {
      //       return { success: false, message: error };
      //     });
    

      // });
    
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
