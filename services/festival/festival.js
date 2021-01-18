"use strict";

// Libraries
const { db } = require("../../db/db-config");

const getAllFestivals = async () => {
  let query = db.
  select("*")
  .from("festivals");
  return await query
  .then((value) => {
    return { success: true, details: value };
  })
}

module.exports = {
  getAllFestivals,
};