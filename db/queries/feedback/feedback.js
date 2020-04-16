"use strict";

// Feedback table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export feedback table
module.exports = {
  createFeedback: async (feedback, user_id) => {
    const food_ad_number = feedback.food_ad_number;
    const profile_img_url = feedback.profile_img_url;
    const first_name = feedback.first_name;
    const body = feedback.body;
    try {
      const returning = await db("feedbacks")
        .insert({
          user_id,
          food_ad_number,
          profile_img_url,
          first_name,
          body
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getAllFeedback: async () => {
    try {
      const returning = await db("feedbacks");
      return { success: true, feedbacks: returning };
    } catch (err) {
      return { success: false, message: "No feedback found." };
    }
  },
  deleteFeedback: async id => {
    try {
      const returning = await db("feedbacks")
        .where("id", id)
        .del();
      if (returning) {
        return {
          success: true,
          message: "Feedback has been deleted."
        };
      }
    } catch (err) {
      return { success: false, data: err };
    }
  }
};
