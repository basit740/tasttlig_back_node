"use strict";

// Purchases table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export purchases table
module.exports = {
  createPurchase: async (purchase, user_id) => {
    const food_id = purchase.food_id;
    const amount = purchase.amount;
    const receipt_email = purchase.receipt_email;
    const receipt_url = purchase.receipt_url;
    const fingerprint = purchase.fingerprint;
    const description = purchase.description;
    const shipping_address = purchase.shipping_address;
    const quantity = purchase.quantity;
    try {
      const returning = await db("purchases")
        .insert({
          user_id,
          food_id,
          amount,
          receipt_email,
          receipt_url,
          fingerprint,
          description,
          shipping_address,
          quantity
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
      const returning = await db("purchases").innerJoin("users", "purchases.user_id", "users.id").innerJoin("foods", "purchases.food_id", "foods.id");
      return { success: true, purchases: returning };
    } catch (err) {
      return { success: false, message: "No purchase(s) found." };
    }
  },
  getIncomingPurchase: async food_id => {
    try {
      const returning = await db("purchases").where("food_id", food_id);
      return { success: true, purchases: returning };
    } catch (err) {
      return { success: false, message: "No incoming purchase(s) found." };
    }
  },
  updateIncomingPurchase: async purchase => {
    // const food_id = purchase.food_id;
    const accept = purchase.accept;
    const reject_note = purchase.reject_note;
    try {
      const returning = await db("purchases")
        // .where("food_id", food_id)
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
