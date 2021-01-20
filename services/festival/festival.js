"use strict";

// Libraries
const { db } = require("../../db/db-config");

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
    );

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

  if (filters.latitude && filters.longitude) {
    query.select(
      gis
        .distance(
          "food_samples.coordinates",
          gis.geography(gis.makePoint(filters.longitude, filters.latitude))
        )
        .as("distanceAway")
    );
    query.where(
      gis.dwithin(
        "food_samples.coordinates",
        gis.geography(gis.makePoint(filters.longitude, filters.latitude)),
        filters.radius || 100000
      )
    );
    query.orderBy("distanceAway", "asc");
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
                "main.title, " +
                "main.description, " +
                "main.business_name, " +
                "main.first_name, " +
                "main.last_name, " +
                "main.address, " +
                "main.city, " +
                "main.state, " +
                "main.postal_code)) as search_text"
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
const createNewFestival = async (
  festival_details,
  festival_images,
  festival_image_description
) => {
  try {
    await db.transaction(async (trx) => {
      const db_festival = await trx("festivals")
        .insert(festival_details)
        .returning("*");

      if (!db_festival) {
        return { success: false, details: "Inserting new festival failed." };
      }
      console.log(db_festival);
      const images = festival_images.map((festival_image_url) => ({
        festival_id: db_festival[0].festival_id,
        festival_image_url,
        //festival_image_description
      }));

      await trx("festival_images").insert(images);
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};
// add sponsor to festival database
const sponsorToFestival = async (festival_business_sponsor_id, festival_id) => {
  try {
    await db.transaction (async (trx) => {
      const db_sponsor_festival = await trx("festivals")
      .where({festival_id})
      .update( {
        festival_business_sponsor_id 
      })
      .returning("*");
      if (!db_sponsor_festival) {
        return { success: false, details: "Inserting new sponsor failed." };
      }
    })
    //console.log(db_sponsor_festival);
    return {success: true, details: "Success."}
  } catch (error) {
    return {success: false, details: error.message};
  }
}
// add host to festival database
const hostToFestival = async (festival_id, festival_restaurant_host_id) => {
  try {
    const db_host = await db("festivals")
      .where({festival_id})
      .update({
        festival_restaurant_host_id,
      })
      .returning("*")
      console.log(db_host);
      if (!db_host) {
        return { success: false, details: "Inserting new host failed." };
      }
    //console.log(db_sponsor_festival);
    return {success: true, details: "Success."}
  } catch (error) {
    return {success: false, details: error.message};
  }
}

module.exports = {
  getAllFestivals,
  createNewFestival,
  sponsorToFestival,
  hostToFestival
};
