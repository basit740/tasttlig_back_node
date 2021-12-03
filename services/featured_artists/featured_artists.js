"use strict";

// Libraries
const { db } = require("../../db/db-config");

const getFeaturedArtists = async () => {
  let query = db("featured_artists").select("*");

  return await query
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

module.exports = {
  getFeaturedArtists,
};
