"use strict";

// Refresh tokens table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export refresh tokens table
module.exports = {
  storeToken: async (refresh_token, user_id) => {
    try {
      const response = await db("tasttlig_refresh_tokens")
        .select()
        .where("user_id", user_id);
      if (response.length === 0) {
        try {
          await db("tasttlig_refresh_tokens").insert({
            refresh_token,
            user_id
          });
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          await db("tasttlig_refresh_tokens")
            .where("user_id", user_id)
            .update("refresh_token", refresh_token)
            .returning("*");
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      return (response = { success: false, message: err });
    }
  },
  checkToken: async (refresh_token, user_id) => {
    try {
      const returning = await db("tasttlig_refresh_tokens")
        .where("user_id", user_id)
        .where("refresh_token", refresh_token);
      return (response = { success: true, message: "ok", response: returning });
    } catch (err) {
      return (response = { success: false, message: err });
    }
  }
};
