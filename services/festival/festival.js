"use strict";

// Libraries
const { db } = require("../../db/db-config");
const { formatTime } = require("../../functions/functions");

// Get all festivals helper function
const getAllFestivals = async (currentPage, keyword, filters) => {
  let startDate = filters.startDate.substring(0, 10);
  let startTime = formatTime(filters.startTime);
  let query = db
    .select(
      "festivals.*",
      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
    )
    .from("festivals")
    .leftJoin(
      "festival_images",
      "festivals.festival_id",
      "festival_images.festival_id"
    )
    .where("festivals.festival_id", ">", 3)
    .groupBy("festivals.festival_id");

  if (filters.nationalities && filters.nationalities.length) {
    query.whereIn("nationalities.nationality", filters.nationalities);
  }

  if (filters.startDate) {
    query.where("festivals.festival_start_date", ">=", startDate);
  }

  if (filters.startTime) {
    query.where("festivals.festival_start_time", ">=", startTime);
  }

  if (filters.cityLocation) {
    query.where("festivals.festival_city", "=", filters.cityLocation);
  }

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
                "main.nationality, " +
                "main.festival_name, " +
                "main.festival_type, " +
                "main.festival_price, " +
                "main.festival_city, " +
                "main.description)) as search_text"
            )
          )
          .from(query.as("main"))
          .as("main")
      )
      .orderBy("rank", "desc");
  }

  query = query.paginate({
    perPage: 12,
    isLengthAware: true,
    currentPage: currentPage,
  });

  return await query
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

/* Save new festival to festivals and festival images tables helper 
function */
const createNewFestival = async (festival_details, festival_images) => {
  try {
    await db.transaction(async (trx) => {
      const db_festival = await trx("festivals")
        .insert(festival_details)
        .returning("*");

      if (!db_festival) {
        return { success: false, details: "Inserting new festival failed." };
      }

      const images = festival_images.map((festival_image_url) => ({
        festival_id: db_festival[0].festival_id,
        festival_image_url,
      }));

      await trx("festival_images").insert(images);
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Add host ID to festivals table helper function
const hostToFestival = async (festival_id, festival_restaurant_host_id) => {
  try {
    const db_host = await db("festivals")
      .where({ festival_id })
      .update({
        festival_restaurant_host_id: db.raw(
          "array_append(festival_restaurant_host_id, ?)",
          [festival_restaurant_host_id]
        ),
      })
      .returning("*");

    if (!db_host) {
      return { success: false, details: "Inserting new host failed." };
    }

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// add sponsor to festival database
const sponsorToFestival = async (festival_business_sponsor_id, festival_id) => {
  try {
    await db.transaction(async (trx) => {
      const db_sponsor_festival = await trx("festivals")
        .where({ festival_id })
        .update({
          festival_business_sponsor_id,
        })
        .returning("*");
      if (!db_sponsor_festival) {
        return { success: false, details: "Inserting new sponsor failed." };
      }
    });
    //console.log(db_sponsor_festival);
    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

module.exports = {
  getAllFestivals,
  createNewFestival,
  hostToFestival,
  sponsorToFestival,
};
