"use strict";

// Recommendation table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export recommendations table
module.exports = {
  createRecommendation: async (recommendation, user_id) => {
    const description = recommendation.description;
    try {
      const returning = await db("recommendations")
        .insert({
          user_id,
          description
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getUserRecommendation: async user_id => {
    try {
      const returning = await db("recommendation").where("user_id", user_id);
      return { success: true, recommendations: returning };
    } catch (err) {
      return { success: false, message: "No recommendation found." };
    }
  },
  getAllRecommendation: async () => {
    try {
      const returning = await db("recommendations").innerJoin(
        "users",
        "recommendations.user_id",
        "users.id"
      );
      return { success: true, recommendations: returning };
    } catch (err) {
      return { success: false, message: "No recommendation found." };
    }
  },
  updateIncomingRecommendation: async (recommendation, id) => {
    const reply = recommendation.reply;
    try {
      const returning = await db("recommendations")
        .update({
          id,
          reply
        })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  }
};
