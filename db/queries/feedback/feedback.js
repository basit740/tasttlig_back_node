"use strict";

// Feedback table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export feedback table
module.exports = {
  getAllFeedback: async () => {
    try {
      const returning = await db("feedbacks").where("remove", false);
      return { success: true, feedbacks: returning };
    } catch (err) {
      return { success: false, message: "No feedback found." };
    }
  },
  createFeedback: async (feedback, user_id) => {
    const food_ad_id = feedback.food_ad_id;
    const body = feedback.body;
    const profile_img_url = feedback.profile_img_url;
    const first_name = feedback.first_name;
    try {
      const returning = await db("feedbacks")
        .insert({
          user_id,
          food_ad_id,
          body,
          profile_img_url,
          first_name
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  updateFeedback: async (feedback, id) => {
    const remove = feedback.remove;
    try {
      const returning = await db("feedbacks")
        .where("id", id)
        .update({ remove })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  }
};
