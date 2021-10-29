"use strict";

// Libraries
const { db, gis } = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const moment = require("moment");

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

module.exports = {
  addToInterested,
};
