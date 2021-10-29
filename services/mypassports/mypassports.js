"use strict";

// Libraries
const {db, gis} = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const moment = require("moment");

// Get all passports from user
const getPassportsFromUser = async (
  user_id
) => {
  let query = db
    .select('passports.user_id', 'passports.festival_id')
    .from("passports")
    .join('tasttlig_users', 'passports.user_id', '=', 'tasttlig_users.tasttlig_user_id')
    .join('festivals', 'passports.festival_id', '=', 'festivals.festival_id')
    .where( "tasttlig_users.tasttlig_user_id", user_id);

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

module.exports = {
  getPassportsFromUser,
};