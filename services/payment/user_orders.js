"use strict";

const {db} = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

const getOrderDetails = async(order_details) => {
  if (order_details.item_type === "subscription"){
    return await db("subscriptions")
      .where({
        subscription_code: order_details.item_id,
        status: "ACTIVE"
      })
      .first()
      .then(value => {
        if (!value){
          return { success: false, message: "No Subscription found." };
        }
        return { success: true, item: value };
      })
      .catch(error => {
        return { success: false, message: error };
      });
  } else if (order_details.item_type === "food_sample"){
    return await db("food_samples")
      .where({
        food_sample_id: order_details.item_id,
        status: "ACTIVE"
      })
      .first()
      .then(value => {
        if (!value){
          return { success: false, message: "No Food Sample found." };
        }
        return { success: true, item: value };
      })
      .catch(error => {
        return { success: false, message: error };
      });
  }
  return { success: false, message: "Item type not supported" };
}

const createOrder = async(order_details, db_order_details) => {
  if (order_details.item_type === "subscription") {
    try {
      await db.transaction(async trx => {
        const total_amount_before_tax = parseFloat(db_order_details.item.price);
        const total_tax = Math.round(total_amount_before_tax * 13) / 100;
        const db_orders = await trx("orders")
          .insert({
            order_by_user_id: order_details.user_id,
            status: "SUCCESS",
            total_amount_before_tax: total_amount_before_tax,
            total_tax: total_tax,
            total_amount_after_tax: total_amount_before_tax + total_tax,
            order_datetime: new Date()
          })
          .returning("*");
        if (!db_orders) {
          return {success: false, details: "Inserting new Order failed"};
        }
        await trx("order_items")
          .insert({
            order_id: db_orders[0].order_id,
            item_id: order_details.item_id,
            item_type: order_details.item_type,
            quantity: 1,
            price_before_tax: total_amount_before_tax
          });
        await trx("payments")
          .insert({
            order_id: db_orders[0].order_id,
            payment_reference_number: order_details.payment_id,
            payment_type: "CARD",
            payment_vender: "STRIPE"
          });
        let subscription_end_datetime = null;
        if(db_order_details.subscription.validity_in_months){
          subscription_end_datetime = new Date()
            .setMonth(new Date().getMonth()
              + db_order_details.item.validity_in_months)
        } else {
          subscription_end_datetime = db_order_details.item.date_of_expiry;
        }
        await trx("user_subscriptions")
          .insert({
            subscription_code: db_order_details.item.subscription_code,
            user_id: order_details.user_id,
            subscription_start_datetime: new Date(),
            subscription_end_datetime: subscription_end_datetime
          });
      });
      //Email to user on submitting the request to upgrade
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: order_details.user_email,
        bcc: ADMIN_EMAIL,
        subject: "[Tasttlig] Subscription Purchase",
        template: 'new_subscription_purchase',
        context: {
          passport_name: "Festival"
        }
      });
      return {success: true, details: "success"};
    } catch (err) {
      return {success: false, details: err.message};
    }
  } else if (order_details.item_type === "food_sample") {
    try {
      await db.transaction(async trx => {
        const total_amount_before_tax = parseFloat(db_order_details.item.price);
        const total_tax = Math.round(total_amount_before_tax * 13) / 100;
        const db_orders = await trx("orders")
          .insert({
            order_by_user_id: order_details.user_id,
            status: "SUCCESS",
            total_amount_before_tax: total_amount_before_tax,
            total_tax: total_tax,
            total_amount_after_tax: total_amount_before_tax + total_tax,
            order_datetime: new Date()
          })
          .returning("*");
        if (!db_orders) {
          return {success: false, details: "Inserting new Order failed"};
        }
        await trx("order_items")
          .insert({
            order_id: db_orders[0].order_id,
            item_id: order_details.item_id,
            item_type: order_details.item_type,
            quantity: 1,
            price_before_tax: total_amount_before_tax
          });
        await trx("payments")
          .insert({
            order_id: db_orders[0].order_id,
            payment_reference_number: order_details.payment_id,
            payment_type: "CARD",
            payment_vender: "STRIPE"
          });
      });
      //Email to user on success purchase
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: order_details.user_email,
        bcc: ADMIN_EMAIL,
        subject: "[Tasttlig] Purchase Successful",
        template: 'new_food_sample_purchase',
        context: {
          title: db_order_details.item.title
        }
      });
      return {success: true, details: "success"};
    } catch (err) {
      return {success: false, details: err.message};
    }
  } else {
    return {success: false, details: "Invalid Item Type"};
  }
}

module.exports = {
  getOrderDetails,
  createOrder
}