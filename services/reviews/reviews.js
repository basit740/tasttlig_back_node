"use strict";

// Libraries
const { db } = require("../../db/db-config");

// Create review helper function
const updateReview = async (
  user_details_from_db,
  review_information,
  review_id
) => {
  try {
    await db.transaction(async (trx) => {
      const db_review = await trx("user_reviews")
        .update(review_information)
        .where({ review_id })
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
// Create review helper function
const updatePopUpCount = async (user_id, review_id) => {
  try {
    await db.transaction(async (trx) => {
      const db_review = await trx("user_reviews")
        .where({
          review_user_id: user_id,
          review_id,
        })
        .increment("review_ask_count", 1)
        .returning("*");

      if (!db_review) {
        return { success: false, details: "Incrementing failed" };
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }
};

//search for non reviewed entries for user
const getNonReviewedFromUser = async (user_id, product_id) => {
  try {
    return await db
      .select(
        "user_reviews.*",
        "business_details.business_name",
        "products.title",
        db.raw("ARRAY_AGG(product_images.product_image_url) as image_urls")
      )
      .from("user_reviews")
      .leftJoin(
        "products",
        "user_reviews.review_product_id",
        "products.product_id"
      )
      .leftJoin(
        "business_details",
        "user_reviews.review_user_id",
        "business_details.business_details_user_id"
      )
      .leftJoin(
        "product_images",
        "products.product_id",
        "product_images.product_id"
      )
      /* .where("user_reviews.review_user_id", "=", user_id)
      .andWhere("user_reviews.review_status", "=", "NOT REVIEWED") */
      .where({
        review_user_id: user_id,
        review_status: "NOT REVIEWED",
        //review_product_id: product_id,
      })
      //.andWhere("user_reviews.review_ask_count", "<", "3")
      .groupBy(
        "business_details.business_name",
        "products.title",
        "products.product_id",
        "business_details.business_details_user_id",
        "user_reviews.review_user_id",
        "user_reviews.review_product_id",
        "user_reviews.review_id",
        "products.product_id",
        "product_images.product_id"
      )
      //.first()
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
  updatePopUpCount,
  getNonReviewedFromUser,
};
