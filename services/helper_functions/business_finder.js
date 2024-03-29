"use strict";

// Libraries
const { db } = require("../../db/db-config");

// Get business keyword helper function
const getTopBusinessSuggestions = async (keyword) => {
  let query = db.select("*").from("business_details");

  if (keyword) {
    query = db
      .select(
        "*",
        db.raw(
          "CASE WHEN (phraseto_tsquery('??')::text = '') THEN 0 " +
            "ELSE ts_rank_cd(main.search_text, (phraseto_tsquery('??')::text || ':*')::tsquery) " +
            "END rank",
          [keyword, keyword]
        )
      )
      .from(
        db
          .select(
            "main.*",
            db.raw(
              "to_tsvector(concat_ws(' '," +
                "main.business_name, " +
                "main.business_address_1, " +
                "main.business_address_2, " +
                "main.city, " +
                "main.state, " +
                "main.country, " +
                "main.zip_postal_code" +
                ")) as search_text"
            )
          )
          .from(query.as("main"))
          .as("main")
      )
      .orderBy("rank", "desc");
  }

  query = query.paginate({
    perPage: 5,
    isLengthAware: true,
    currentPage: 1,
  });

  return await query
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// Get restaurants from festival helper function
const getFestivalRestaurants = async (keyword) => {
  let query = db
    .select("*")
    .from("business_details")
    .where("in_current_festival", "true");

  return await query;
};

module.exports = {
  getTopBusinessSuggestions,
  getFestivalRestaurants,
};
