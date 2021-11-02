"use strict";

// Libraries
const {db, gis} = require("../../db/db-config");
const jwt = require("jsonwebtoken");

// Get all passports from user
const getPassportsFromUser = async (
  user_id
) => {
  let query = db
    .select('passports.id', 'passports.user_id', 'passports.festival_id', 'passports.name', 'passports.type', 'passports.price', 'passports.colour',
    'passports.issue_date', 'passports.expire_date', 'passports.season', 'passports.features', 'festivals.festival_name', 'festivals.festival_start_date',
    'festivals.festival_end_date', 'festivals.festival_type', 'festivals.festival_price', 'festivals.festival_description', 'festival_images.festival_image_url')
    .from("passports")
    .join('tasttlig_users', 'passports.user_id', '=', 'tasttlig_users.tasttlig_user_id')
    .join('festivals', 'passports.festival_id', '=', 'festivals.festival_id')
    .join('festival_images', 'festivals.festival_id', '=', 'festival_images.festival_id')
    .where( "tasttlig_users.tasttlig_user_id", user_id);

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

// Get all passports from user, sort by festival
const getPassportsFromUserSortByFestival = async (
  user_id
) => {
  let query = db
    .select('passports.id', 'passports.user_id', 'passports.festival_id', 'passports.name', 'passports.type', 'passports.price', 'passports.colour',
    'passports.issue_date', 'passports.expire_date', 'passports.season', 'passports.features', 'festivals.festival_name', 'festivals.festival_start_date',
    'festivals.festival_end_date', 'festivals.festival_type', 'festivals.festival_price', 'festivals.festival_description')
    .from("passports")
    .join('tasttlig_users', 'passports.user_id', '=', 'tasttlig_users.tasttlig_user_id')
    .join('festivals', 'passports.festival_id', '=', 'festivals.festival_id')
    .where( "tasttlig_users.tasttlig_user_id", user_id)
    .orderBy("festivals.festival_name");

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
  getPassportsFromUserSortByFestival
};