"use strict";

// Libraries
const {db, gis} = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const moment = require("moment");

// Get all favourite passports from user
const getFavouritesFromUser = async (
  user_id
) => {
  let query = db
    .select('fav_passports.user_id', 'fav_passports.passport_id')
    .from("fav_passports")
    .join('tasttlig_users', 'fav_passports.user_id', '=', 'tasttlig_users.tasttlig_user_id')
    .join('passports', 'fav_passports.passport_id', '=', 'passports.id')
    .where( "tasttlig_users.tasttlig_user_id", user_id);

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

// add passport to fav_passports of logged in user
const addToFavourites = async (
  userId,
  passportId
) => {
  let query = db("fav_passports")
    .insert({user_id: userId, passport_id: passportId})
    .returning("*");

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

// delete from fav_passports of logged in user_id and passport id
const deleteFromFavourites = async (
  userId,
  passportId
) => {
  let query = db("fav_passports")
  .where({ user_id: userId, passport_id: passportId })
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
  addToFavourites,
  deleteFromFavourites,
};