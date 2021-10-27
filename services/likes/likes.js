"use strict";

// Libraries
const {db, gis} = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const moment = require("moment");

// Get all likes from user
const getLikesFromUser = async (
  user_id
) => {
  let query = db
    .select('likes.user_id', 'likes.like_festival_id')
    .from("likes")
    .join('tasttlig_users', 'likes.user_id', '=', 'tasttlig_users.tasttlig_user_id')
    .join('festivals', 'likes.like_festival_id', '=', 'festivals.festival_id')
    .where( "tasttlig_users.tasttlig_user_id", user_id);

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

// Get count of likes from festival
const getLikesFromFestival = async (
  festivalId
) => {
  let query = db("likes")
    .count("like_festival_id")
    .where( "like_festival_id", festivalId);

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

// add festival to likes of logged in user
const addToLikes = async (
  userId,
  festivalId
) => {
  let query = db("likes")
    .insert({user_id: userId, like_festival_id: festivalId})
    .returning("*");

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

// delete from likes of logged in user_id and festival id from the details page
const deleteFromLikes = async (
  userId,
  festivalId
) => {
  let query = db("likes")
  .where({ user_id: userId, like_festival_id: festivalId })
  .del()

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

module.exports = {
  getLikesFromUser,
  getLikesFromFestival,
  addToLikes,
  deleteFromLikes,
};