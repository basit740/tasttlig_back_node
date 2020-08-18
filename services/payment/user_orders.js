"use strict";

const db = require("../../db/db-config");

const getOrderDetails = async(order_details) => {
  if (order_details.item_type === "membership"){
    return await db("memberships")
      .where({
        membership_id: order_details.item_id,
        status: "ACTIVE"
      })
      .first()
      .then(value => {
        if (!value){
          return { success: false, message: "No Membership found." };
        }
        return { success: true, membership: value };
      })
      .catch(error => {
        return { success: false, message: error };
      });
  }
  return { success: false, message: "Item type not supported" };
}

const createOrder = async(order_details) => {
  if (order_details.item_type === "membership"){
    try{
      await db.transaction(async trx => {
        const db_orders = await trx("orders")
          .insert({
            order_by_user_id: order_details.user_id,
            status: "SUCCESS",
            total_amount_before_tax: 20,
            total_tax: 2.6,
            total_amount_after_tax: 22.6,
            order_datetime: new Date()
          })
          .returning("*");
        if(!db_orders){
          return {success: false, details:"Inserting new Order failed"};
        }
        await trx("order_items")
          .insert({
            order_id: db_orders[0].order_id,
            item_id: order_details.item_id,
            item_type: order_details.item_type,
            quantity: 1,
            price_before_tax: 22.6
          });
        await trx("payments")
          .insert({
            order_id: db_orders[0].order_id,
            payment_reference_number: order_details.payment_id,
            payment_type: "CARD",
            payment_vender: "STRIPE"
          })
      })
      // Email to user on submitting the request to upgrade
      // await Mailer.sendMail({
      //   to: db_user.email,
      //   bcc: ADMIN_EMAIL,
      //   subject: `[Tasttlig] New Experience Created`,
      //   template: 'new_experience',
      //   context: {
      //     first_name: db_user.first_name,
      //     last_name: db_user.last_name,
      //     title: experience_details.title,
      //     status: experience_details.status
      //   }
      // });
      return {success: true, details:"success"};
    } catch (err) {
      return {success: false, details:err.message};
    }







    return await db("orders")
      .where("membership_id", order_details.item_id)
      .first()
      .then(value => {
        if (!value){
          return { success: false, message: "No Membership found." };
        }
        return { success: true, membership: value };
      })
      .catch(error => {
        return { success: false, message: error };
      });
  }
  return { success: false, message: "Item type not supported" };
}

module.exports = {
  getOrderDetails,
  createOrder
}