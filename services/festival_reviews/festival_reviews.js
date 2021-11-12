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
  comment
) => {
  let query = db("festival_reviews")
    .insert({ festival_id, user_id, first_name, last_name, rating, comment })
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

module.exports = {
  addToFestivalReviews,
  getFestivalReviews
};
