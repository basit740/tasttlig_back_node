"use strict";

// Libraries
const { db } = require("../../db/db-config");

// Create review helper function
const updateReview = async (user_details_from_db, review_information) => {
  try {
    await db.transaction(async (trx) => {
      const db_review = await trx("user_reviews")
        .insert(review_information)
        .returning("*");

      if (!db_review) {
        return { success: false, details: "Inserting new review failed." };
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }
};

module.exports = { updateReview };
