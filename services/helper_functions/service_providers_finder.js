"use strict";

// Libraries
const { db } = require("../../db/db-config");

// Get food provider keyword helper function
const getMostRelevantFoodProviders = async (experience_details) => {
  let relevance_text = `${experience_details.title} ${experience_details.food_description}`;
  let query = db
    .select(
      "*",
      db.raw(
        "CASE WHEN (phraseto_tsquery('??')::text = '') THEN 0 " +
          "ELSE ts_rank_cd(main.search_text, (phraseto_tsquery('??')::text || ':*')::tsquery) " +
          "END rank",
        [relevance_text, relevance_text]
      )
    )
    .from(
      db
        .select(
          "main.*",
          db.raw(
            "to_tsvector(concat_ws(' '," +
              "main.description, " +
              "main.type, " +
              "main.nationality, " +
              "main.nationality_country, " +
              "main.continent" +
              ")) as search_text"
          )
        )
        .from(
          db
            .select(
              "menu_items.*",
              "nationality.nationality",
              db.raw("nationality.country as nationality_country"),
              "nationality.continent"
            )
            .from("menu_items")
            .leftJoin(
              "nationalities",
              "menu_items.nationality_id",
              "nationalities.id"
            )
            .as("main")
        )
        .as("main")
    )
    .orderBy("rank", "desc");

  query = query.paginate({
    perPage: 10,
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

module.exports = {
  getMostRelevantFoodProviders,
};
