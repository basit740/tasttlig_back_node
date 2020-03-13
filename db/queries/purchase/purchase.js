"use strict";

// Purchases table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export purchases table
module.exports = {
  createPurchase: async (purchase, user_id) => {
    const cost = purchase.cost;
    const receipt_email = purchase.receipt_email;
    const receipt_url = purchase.receipt_url;
    const fingerprint = purchase.fingerprint;
    const description = purchase.description;
    const quantity = purchase.quantity;
    try {
      const returning = await db("purchases")
        .insert({
          user_id,
          cost,
          receipt_email,
          receipt_url,
          fingerprint,
          description,
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
      const returning = await db("purchases").innerJoin("users", "purchases.user_id", "users.id")
      return { success: true, purchases: returning };
    } catch (err) {
      return { success: false, message: "No purchase(s) found." };
    }
  },
  updateIncomingPurchase: async purchase => {
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
