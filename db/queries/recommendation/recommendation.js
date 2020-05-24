"use strict";

// Recommendation table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export recommendations table
module.exports = {
  getAllRecommendation: async () => {
    try {
      const returning = await db("recommendations");
      return { success: true, recommendations: returning };
    } catch (err) {
      return { success: false, message: "No recommendation found." };
    }
  },
  getUserRecommendation: async user_id => {
    try {
      const returning = await db("recommendations").where("user_id", user_id);
      return { success: true, recommendations: returning };
    } catch (err) {
      return { success: false, message: "No recommendation found." };
    }
  },
  createRecommendation: async (recommendation, user_id) => {
    const profile_img_url = recommendation.profile_img_url;
    const first_name = recommendation.first_name;
    const last_name = recommendation.last_name;
    const description = recommendation.description;
    try {
      const returning = await db("recommendations")
        .insert({
          user_id,
          profile_img_url,
          first_name,
          last_name,
          description
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  updateRecommendation: async (recommendation, id) => {
    const reply = recommendation.reply;
    try {
      const returning = await db("recommendations")
        .where("id", id)
        .update({ reply })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  deleteRecommendation: async id => {
    try {
      const returning = await db("recommendations")
        .where("id", id)
        .del();
      if (returning) {
        return {
          success: true,
          message: "Recommendation has been deleted."
        };
      }
    } catch (err) {
      return { success: false, data: err };
    }
  }
};
