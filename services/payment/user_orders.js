"use strict";

const {db} = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const moment = require("moment");

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
  } else if (order_details.item_type === "experience"){
    return await db("experiences")
      .where({
        experience_id: order_details.item_id,
        status: "ACTIVE"
      })
      .first()
      .then(value => {
        if (!value){
          return { success: false, message: "No experience found." };
        }
        return { success: true, item: value };
      })
      .catch(error => {
        return { success: false, message: error };
      });
  }
  return { success: false, message: "Item type not supported" };
}

const getCartOrderDetails = async(cartItems) => {
  let experienceIdList = [];
  let CartItemDetails = [];
  cartItems.map(item => {
    experienceIdList.push(item.itemId);
  });
  return await db
    .select("*")
    .from("experiences")
    .whereIn("experiences.experience_id", experienceIdList)
    .then(value => {
      let totalPrice = 0;
      value.map(item => {
        let itemPrice = 0;
        cartItems.map(cartItem => {
          if(cartItem.itemId == item.experience_id){
            CartItemDetails.push({
              title: item.title,
              time: moment(moment(new Date(item.start_date).toISOString().split("T")[0] +
                "T" + item.start_time + ".000Z").add(new Date().getTimezoneOffset(), "m")).format("MMM Do") + " " +
                moment(moment(new Date(item.start_date).toISOString().split("T")[0] +
                  "T" + item.start_time + ".000Z").add(new Date().getTimezoneOffset(), "m")).format("hh:mm a") + " - " +
                moment(moment(new Date(item.start_date).toISOString().split("T")[0] +
                  "T" + item.end_time + ".000Z").add(new Date().getTimezoneOffset(), "m")).format("hh:mm a"),
              address: item.address + ", " + item.city + ", " + item.state,
              quantity: cartItem.quantity
            });
            itemPrice = parseFloat(item.price) * parseFloat(cartItem.quantity);
          }
        });
        totalPrice = totalPrice + itemPrice;
      });
      return {success: true, details:{cartItemDetails: CartItemDetails, price: totalPrice}};
    })
    .catch(reason => {
      return {success: false, details:reason};
    });
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
        if(db_order_details.item.validity_in_months){
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
  } else if (order_details.item_type === "experience") {
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
        await trx("experience_guests")
          .insert({
            experience_id: db_order_details.item.experience_id,
            guest_user_id: order_details.user_id,
            status: "CONFIRMED",
            created_at_datetime: new Date(),
            updated_at_datetime: new Date()
          });
      });
      //Email to user on success purchase
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: order_details.user_email,
        bcc: ADMIN_EMAIL,
        subject: "[Tasttlig] Purchase Successful",
        template: 'experience/new_experience_purchase',
        context: {
          title: db_order_details.item.title,
          passport_id: order_details.user_passport_id,
          items: [{
            title: db_order_details.item.title,
            time: moment(moment(new Date(db_order_details.item.start_date).toISOString().split("T")[0] +
              "T" + db_order_details.item.start_time + ".000Z").add(new Date().getTimezoneOffset(), "m")).format("MMM Do") + " " +
              moment(moment(new Date(db_order_details.item.start_date).toISOString().split("T")[0] +
                "T" + db_order_details.item.start_time + ".000Z").add(new Date().getTimezoneOffset(), "m")).format("hh:mm a") + " - " +
              moment(moment(new Date(db_order_details.item.start_date).toISOString().split("T")[0] +
                "T" + db_order_details.item.end_time + ".000Z").add(new Date().getTimezoneOffset(), "m")).format("hh:mm a"),
            address: db_order_details.item.address + ", " + db_order_details.item.city + ", " + db_order_details.item.state,
            quantity: 1
          }]
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

const createCartOrder = async(order_details, db_order_details) => {
  try {
    await db.transaction(async trx => {
      const total_amount_before_tax = parseFloat(db_order_details.price);
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
      const orderItems = order_details.cartItems.map(item => ({
        order_id: db_orders[0].order_id,
        item_id: item.itemId,
        item_type: "experience",
        quantity: item.quantity,
        price_before_tax: item.price
      }));
      await trx("order_items")
        .insert(orderItems);
      
      await trx("payments")
        .insert({
          order_id: db_orders[0].order_id,
          payment_reference_number: order_details.payment_id,
          payment_type: "CARD",
          payment_vender: "STRIPE"
        });
    });
    
    //Email to user on successful purchase
    await Mailer.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: order_details.user_email,
      bcc: ADMIN_EMAIL,
      subject: "[Tasttlig] Purchase Successful",
      template: 'experience/new_experience_purchase',
      context: {
        passport_id: order_details.user_passport_id,
        items: db_order_details.cartItemDetails
      }
    });
    return {success: true, details: "success"};
  } catch (err) {
    return {success: false, details: err.message};
  }
}

module.exports = {
  getOrderDetails,
  createOrder,
  getCartOrderDetails,
  createCartOrder
}