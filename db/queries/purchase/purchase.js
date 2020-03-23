"use strict";

// Purchases table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export purchases table
module.exports = {
  createPurchase: async (purchase, user_id) => {
    const profile_img_url = purchase.profile_img_url;
    const first_name = purchase.first_name;
    const last_name = purchase.last_name;
    const food_img_url = purchase.food_img_url;
    const quantity = purchase.quantity;
    const description = purchase.description;
    const cost = purchase.cost;
    const ready_time = purchase.ready_time;
    const time_type = purchase.time_type;
    const order_code = purchase.order_code;
    const phone_number = purchase.phone_number;
    const receipt_email = purchase.receipt_email;
    const receipt_url = purchase.receipt_url;
    const fingerprint = purchase.fingerprint;
    try {
      const returning = await db("purchases")
        .insert({
          user_id,
          profile_img_url,
          first_name,
          last_name,
          food_img_url,
          quantity,
          description,
          cost,
          ready_time,
          time_type,
          order_code,
          phone_number,
          receipt_email,
          receipt_url,
          fingerprint
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getUserPurchase: async user_id => {
    try {
      const returning = await db("purchases").where("user_id", user_id);
      return { success: true, purchases: returning };
    } catch (err) {
      return { success: false, message: "No purchase(s) found." };
    }
  },
  getAllPurchase: async () => {
    try {
      const returning = await db("purchases");
      return { success: true, purchases: returning };
    } catch (err) {
      return { success: false, message: "No purchase(s) found." };
    }
  },
  updatePurchase: async purchase => {
    const accept = purchase.accept;
    const reject_note = purchase.reject_note;
    try {
      const returning = await db("purchases")
        .update({
          accept,
          reject_note
        })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  }
};
