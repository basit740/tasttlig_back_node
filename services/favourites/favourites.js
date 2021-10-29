"use strict";

// Libraries
const {db, gis} = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const moment = require("moment");

// Get all favourites from user
const getFavouritesFromUser = async (
  user_id
) => {
  let query = db
    .select('favourites.user_id', 'favourites.festival_id')
    .from("favourites")
    .join('tasttlig_users', 'favourites.user_id', '=', 'tasttlig_users.tasttlig_user_id')
    .join('festivals', 'favourites.festival_id', '=', 'festivals.festival_id')
    .where( "tasttlig_users.tasttlig_user_id", user_id);

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

// Get count of favourites from festival
const getFavouritesFromFestival = async (
  festivalId
) => {
  let query = db("favourites")
    .count("festival_id")
    .where( "festival_id", festivalId);

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

// add festival to likes of logged in user
const addToFavourites = async (
  userId,
  festivalId
) => {
  let query = db("favourites")
    .insert({user_id: userId, festival_id: festivalId})
    .returning("*");

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

// delete from favourites of logged in user_id and festival id from the details page
const deleteFromFavourites = async (
  userId,
  festivalId
) => {
  let query = db("favourites")
  .where({ user_id: userId, festival_id: festivalId })
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
  getFavouritesFromUser,
  getFavouritesFromFestival,
  addToFavourites,
  deleteFromFavourites,
};