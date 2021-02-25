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
      console.log(value)
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log(reason);
      return { success: false, details: reason };
    });
}

const getAllFestivalsPresent = async () => {
  
  return await db
  .select("festivals.*")
  .from("festivals")
  .where("festivals.festival_id", ">", 3)
  .groupBy("festivals.festival_id")
  .then((value) => {
    return { success: true, festival_list: value };
  })
  .catch((reason) => {
    return { success: false, data: reason };
  });
  
  }



 
 


// Get festival list helper function
const getFestivalList = async () => {
  return await db
    .select("festivals.*")
    .from("festivals")
    .where("festivals.festival_id", ">", 3)
    .groupBy("festivals.festival_id")
    .then((value) => {
      return { success: true, festival_list: value };
    })
    .catch((reason) => {
      return { success: false, data: reason };
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

      console.log(festival_images)
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

const updateFestival = async (data, festival_images) => {
  try {
    await db.transaction(async (trx) => {
      const db_festival = await trx("festivals")
      .where( {"festival_id": data.festival_id})
      .update({
              festival_name: data.festival_name,
              festival_type: data.festival_type,
              festival_price: data.festival_price,
              festival_city: data.festival_city,
              festival_start_date: data.festival_start_date,
              festival_end_date: data.festival_end_date,
              festival_start_time: data.festival_start_time,
              festival_end_time: data.festival_end_time,
              festival_description: data.festival_description,
            })
      .returning("*")

      await trx("festival_images").where( {"festival_id": data.festival_id}).update({festival_image_url: festival_images[0]}).returning("*");
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
  
};


// Add host ID to festivals table helper function
const hostToFestival = async (festival_id, festival_vendor_id) => {
  try {
    console.log(festival_id, "festival_id")
    console.log(festival_vendor_id, "festival vendor id")
    await db.transaction(async (trx) => {
      if (typeof(festival_id) === "object") {
        for (let item of festival_id) {
          const db_host = await trx("festivals")
            .where({ festival_id: item })
            .update({
              festival_vendor_id: trx.raw(
                "array_append(festival_vendor_id, ?)",
                [festival_vendor_id]
              ),
            })
            .returning("*");
  
          if (!db_host) {
            return { success: false, details: "Inserting new host failed." };
          }
        }
      } else {
        const db_host = await trx("festivals")
        .where({ festival_id })
        .update({
          festival_vendor_id: trx.raw(
            "array_append(festival_vendor_id, ?)",
            [festival_vendor_id]
          ),
        })
        .returning("*");

      if (!db_host) {
        return { success: false, details: "Inserting new host failed." };
      }
    }
    });
    return { success: true, details: "Success." };
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }
};

// Add sponsor to festivals table helper function
const sponsorToFestival = async (festival_id, festival_business_sponsor_id) => {
  try {
    await db.transaction(async (trx) => {
      const db_sponsor_festival = await trx("festivals")
        .where({ festival_id })
        .update({
          festival_business_sponsor_id: trx.raw(
            "array_append(festival_business_sponsor_id, ?)",
            [festival_business_sponsor_id]
          ),
        })
        .returning("*");

      if (!db_sponsor_festival) {
        return { success: false, details: "Inserting new sponsor failed." };
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Get festival details helper function
const getFestivalDetails = async (festival_id) => {
  return await db
    .select(
      "festivals.*",
      "b1.business_name AS business",
      "b2.business_name AS sponsor",
      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
    )
    .from("festivals")
    .leftJoin(
      "festival_images",
      "festivals.festival_id",
      "festival_images.festival_id"
    )
    .leftJoin(
      "business_details AS b1",
      "festivals.festival_user_admin_id[1]",
      "b1.business_details_user_id"
    )
    .leftJoin(
      "sponsors",
      "festivals.festival_business_sponsor_id[1]",
      "sponsors.sponsor_id"
    )
    .leftJoin(
      "business_details AS b2",
      "sponsors.sponsor_business_id",
      "b2.business_details_user_id"
    )
    .groupBy("festivals.festival_id")
    .groupBy("b1.business_name")
    .groupBy("b2.business_name")
    .having("festivals.festival_id", "=", festival_id)
    .then((value) => {
      return {
        success: true, details: value
      };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

const getFestivalRestaurants = async (host_id, festival_id) => {
  let productQuery = db
    .select(
      "products.*",
      "business_details.*"
      /*  db.raw("ARRAY_AGG(business_details_images.business_details_image_url) as image_urls") */
    )
    .from("products")
    .leftJoin(
      "business_details",
      "products.product_business_id",
      "business_details.business_details_id"
    )
    .leftJoin(
      "product_images",
      "products.product_id",
      "product_images.product_id"
    )
    .groupBy("business_details.business_details_id")
    .groupBy("products.product_name")
    .having("products.product_business_id", "=", host_id[0])

  return await productQuery
    .then((value) => {
      console.log(value)
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log(reason)
      return { success: false, details: reason };
    });
};

module.exports = {
  getAllFestivals,
  getFestivalList,
  createNewFestival,
  hostToFestival,
  sponsorToFestival,
  getFestivalDetails,
  getFestivalRestaurants,
  getAllFestivalsPresent,
  updateFestival
};
