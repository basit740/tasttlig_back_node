"use strict";

// Libraries
const { db } = require("../../db/db-config");

// Create review helper function
const updateReview = async (user_details_from_db, review_information) => {
  try {
    await db.transaction(async (trx) => {
      const db_review = await trx("user_reviews")
        .update(review_information)
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

//search for non reviewed entries for user
const getNonReviewedFromUser = async (user_id) => {
  try {
    return await db
      .select("user_reviews.*")
      .from("user_reviews")
      /* .where("user_reviews.review_user_id", "=", user_id)
      .andWhere("user_reviews.review_status", "=", "NOT REVIEWED") */
      .where({
        review_user_id: user_id,
        review_status: "NOT REVIEWED",
      })
      .first()
      .then((value) => {
        return { success: true, details: value };
      })
      .catch((reason) => {
        console.log(reason);
        return { success: false, details: reason };
      });
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }
};

module.exports = {
  updateReview,
  getNonReviewedFromUser,
};
