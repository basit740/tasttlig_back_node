"use strict";

// Libraries
const { db, gis } = require("../../db/db-config");
// const jwt = require("jsonwebtoken");

// add festival to user_follows_fest of logged in user
const addToFestivalReviews = async (
  festival_id,
  user_id,
  first_name,
  last_name,
  rating,
  comment,
  excellence,
  xenial,
  polite,
  ethical,
  receptive,
  impressive,
  ecofriendly,
  novel,
  clean,
  enjoyable
) => {
  let query = db("festival_reviews")
    .insert({
      festival_id,
      user_id,
      first_name,
      last_name,
      rating,
      comment,
      excellence,
      xenial,
      polite,
      ethical,
      receptive,
      impressive,
      ecofriendly,
      novel,
      clean,
      enjoyable,
    })
    .returning("*");

  return await query
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

const getFestivalReviews = async (festival_id) => {
  let query = db("festival_reviews")
    .select("*")
    .where("festival_id", festival_id)
    .orderBy("festival_id");

  return await query
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// get all festival_reviews for admin page
const getFestivalReviewsAdmin = async () => {
  let query = db.select("*").from("festival_reviews");

  return await query
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

module.exports = {
  addToFestivalReviews,
  getFestivalReviews,
  getFestivalReviewsAdmin,
};
