"use strict";

// Libraries
const { db, gis } = require("../../db/db-config");
const jwt = require("jsonwebtoken");

// increment interested in festivals table
const addToInterested = async (festivalId) => {
  let query = db("festivals")
    .where("festival_id", "=", festivalId)
    .increment("festival_interested", 1);

  return await query
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// get all follow_id from user_follows_fest of logged in user
const getFollowsFestFromUser = async (
  user_id
) => {
  let query = db
    .select('user_follows_fest.user_id', 'user_follows_fest.follow_id')
    .from("user_follows_fest")
    .join('tasttlig_users', 'user_follows_fest.user_id', '=', 'tasttlig_users.tasttlig_user_id')
    .join('festivals', 'user_follows_fest.follow_id', '=', 'festivals.festival_id')
    .where( "tasttlig_users.tasttlig_user_id", user_id);

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

// add festival to user_follows_fest of logged in user
const addToUserFollowsFest = async (
  userId,
  festivalId
) => {
  let query = db("user_follows_fest")
    .insert({user_id: userId, follow_id: festivalId})
    .returning("*");

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

// delete from user_follows_fest of logged in user_id and festival id
const deleteFromUserFollowsFest = async (
  userId,
  festivalId
) => {
  let query = db("user_follows_fest")
  .where({ user_id: userId, follow_id: festivalId })
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
  addToInterested,
  addToUserFollowsFest,
  deleteFromUserFollowsFest,
  getFollowsFestFromUser
};
