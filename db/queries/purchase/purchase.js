"use strict";

// Purchases table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export purchases table
module.exports = {
  createPurchase: async (purchase, user_id) => {
    const charge_id = purchase.charge_id;
    const amount = purchase.amount;
    const receipt_email = purchase.receipt_email;
    const receipt_url = purchase.receipt_url;
    const source_id = purchase.source_id;
    const fingerprint = purchase.fingerprint;
    const description = purchase.description;
    const shipping_address = purchase.shipping_address;
    const food_number = purchase.food_number;
    const quantity = purchase.quantity;
    const accept = purchase.accept;
    const reject_note = purchase.reject_note;
    try {
      const returning = await db("purchases")
        .insert({
          user_id,
          charge_id,
          amount,
          receipt_email,
          receipt_url,
          source_id,
          fingerprint,
          description,
          shipping_address,
          food_number,
          quantity,
          accept,
          reject_note
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getUserPurchases: async user_id => {
    try {
      const returning = await db("purchases").where("user_id", user_id);
      return (response = { success: true, purchases: returning });
    } catch (err) {
      return (response = { success: false, message: "No purchase(s) found." });
    }
  },
  getAllPurchases: async () => {
    try {
      const returning = await db("purchases");
      return (response = { success: true, purchases: returning });
    } catch (err) {
      return (response = { success: false, message: "No purchase(s) found." });
    }
  }
};
