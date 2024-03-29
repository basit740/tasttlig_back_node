"use strict";

// Libraries
const Food_Sample_Claim_Status = require("../../enums/food_sample_claim_status");
const {db, gis} = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const {
  formatTime,
  generateRandomString,
} = require("../../functions/functions");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const {setAddressCoordinates} = require("../geocoder");

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const SITE_BASE = process.env.SITE_BASE;

// Get all food samples in festival helper function
const getAllProductsInFestival = async (
  operator,
  status,
  keyword,
  filters,
  festival_id
) => {
  const startOfDay = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
  const endOfDay = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
  let startDate;
  let endDate;
  let startTime;
  let endTime;
  if (
    filters.startDate &&
    filters.endDate &&
    filters.startTime &&
    filters.endDate
  ) {
    startDate = filters.startDate.substring(0, 10);
    endDate = filters.endDate.substring(0, 10);
    startTime = formatTime(filters.startDate);
    endTime = formatTime(filters.endDate);
  }
  let query = db
    .select(
      "products.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      "business_details.*",
      "business_details.business_details_id",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      "promotions.promotion_name",
      db.raw("ARRAY_AGG(product_images.product_image_url) as image_urls")
    )
    .from("products")
    .leftJoin(
      "product_images",
      "products.product_id",
      "product_images.product_id"
    )
    .leftJoin(
      "business_details",
      "products.product_business_id",
      "business_details.business_details_id"
    )
    .leftJoin(
      "tasttlig_users",
      "business_details.business_details_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .leftJoin("nationalities", "products.nationality_id", "nationalities.id")
    .leftJoin(
      "festivals",
      "products.festival_selected[1]",
      "festivals.festival_id"
    )
    .leftJoin(
      "promotions",
      "products.promotional_discount_id",
      "promotions.promotion_id"
    )
    .groupBy("products.product_id")
    .groupBy("tasttlig_users.first_name")
    .groupBy("tasttlig_users.last_name")
    .groupBy("business_details.business_name")
    .groupBy("business_details.business_details_id")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .groupBy("festivals.festival_id")
    .groupBy("promotions.promotion_id")
    .having("products.status", operator, status)
    .having("products.festival_selected", "@>", [festival_id]);

  let orderByArray = [];
  if (filters.price) {
    if (filters.price === "lowest_to_highest") {
      orderByArray.push({column: "products.price", order: "asc"});
    } else if (filters.price === "highest_to_lowest") {
      orderByArray.push({column: "products.price", order: "desc"});
    }
  }
  if (filters.quantity) {
    if (filters.quantity === "lowest_to_highest") {
      orderByArray.push({column: "products.quantity", order: "asc"});
    } else if (filters.quantity === "highest_to_lowest") {
      orderByArray.push({column: "products.quantity", order: "desc"});
    }
  }

  if (filters.price || filters.quantity) {
    query.orderBy(orderByArray);
  }
  if (filters.size) {
    if (filters.size === "bite_size") {
      query.having("products.product_size", "=", "Bite Size");
    } else if (filters.size === "quarter") {
      query.having("products.product_size", "=", "Quarter");
    } else if (filters.size === "half") {
      query.having("products.product_size", "=", "Half");
    } else if (filters.size === "full") {
      query.having("products.product_size", "=", "Full");
    }
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
              "main.title, " +
              "main.description, " +
              "main.first_name, " +
              "main.last_name)) as search_text"
            )
          )
          .from(query.as("main"))
          .as("main")
      )
      .orderBy("rank", "desc");
  }

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

const createNewProduct = async (
  all_product_details,
  all_product_images
  //createdByAdmin,
  //sponsorType
) => {
  try {
    await db.transaction(async (trx) => {
      all_product_details.food_ad_code =
        Math.random().toString(36).substring(2, 4) +
        Math.random().toString(36).substring(2, 4);
      all_product_details.status = "ACTIVE";

      const db_all_product = await trx("products")
        .insert(all_product_details)
        .returning("*");

      await trx("products")
        .where({
          product_id: db_all_product[0].product_id,
        })
        .update({
          product_id: db_all_product[0].product_id,
        });
      if (!db_all_product) {
        return {success: false, details: "Inserting new product failed."};
      }

      const images = all_product_images.map((all_product_image) => ({
        product_id: db_all_product[0].product_id,
        product_image_url: all_product_image,
      }));

      await trx("product_images").insert(images);
      

     });

    return {success: true, details: "Success."};
  } catch (error) {
    // Duplicate key
    if (error.code === 23505) {
      all_product_details.food_ad_code = generateRandomString(4);

      return createNewProduct(
        db_user,
        all_product_details,
        all_product_images,
        createdByAdmin,
        sponsorType
      );
    }

    return {success: false, details: error.message};
  }
};
const createNewProductFromKodidi = async (
  db_user,
  all_product_details,
  all_product_images
) => {
  try {
    await db.transaction(async (trx) => {
      const db_all_product = await trx("products")
        .insert(all_product_details)
        .returning("*");

      if (!db_all_product) {
        return {success: false, details: "Inserting new product failed."};
      }

      const images = all_product_images.map((all_product_image) => ({
        product_id: db_all_product[0].product_id,
        product_image_url: all_product_image,
      }));

      await trx("product_images").insert(images);
    });

    return {success: true, details: "Success."};
  } catch (error) {
    return {success: false, details: error.message};
  }
};

// Get all user food samples helper function
const getAllUserProducts = async (
  user_id,
  operator,
  status,
  keyword,
  currentPage,
  requestByAdmin = false,
  festival_id
) => {
  const startOfDay = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
  const endOfDay = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
  let query = db
    .select(
      "products.*",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      "business_details.business_name",
      "promotions.promotion_name",
      db.raw("ARRAY_AGG(product_images.product_image_url) as image_urls")
      // db.raw(
      //   "(select count(*)::integer from food_sample_claims c where c.food_sample_id=food_samples.food_sample_id and c.status<>? and c.reserved_on between ? and ?) as num_of_claims",
      //   [Food_Sample_Claim_Status.PENDING, startOfDay, endOfDay]
      // )
    )
    .from("products")
    .leftJoin(
      "product_images",
      "products.product_id",
      "product_images.product_id"
    )
    .leftJoin(
      "festivals",
      "products.festival_selected[1]",
      "festivals.festival_id"
    )
    .leftJoin(
      "promotions",
      "promotions.promotion_id",
      "products.promotional_discount_id"
    )
    .leftJoin("nationalities", "products.nationality_id", "nationalities.id")
    .leftJoin(
      "business_details",
      "products.product_business_id",
      "business_details.business_details_id"
    )
    .groupBy("products.product_id")
    .groupBy("festivals.festival_id")
    .groupBy("business_details.business_details_id")
    .groupBy("promotions.promotion_id")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code");

  if (!requestByAdmin) {
    query = query
      .having("business_details_user_id", "=", user_id)
      .having("products.status", operator, status);
  } else {
    query = query.having("products.status", operator, status);
  }

  if (festival_id) {
    query = query.havingRaw(
      "(? != ALL(coalesce(products.festival_selected, array[]::int[])))",
      festival_id
    );
    // ('? = ANY(likes_received)', id);
    //       .whereNotIn("products.festival_selected", [Number(festival_id)]);
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
              "main.title, " +
              "main.description, " +
              "main.nationality" +
              ")) as search_text"
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
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};


// Get all business product helper function
const getAllBusinessProducts = async (
  business_id
) => {
  let query = db
    .select(
      "products.*",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      "business_details.business_name",
      "promotions.promotion_name",
      db.raw("ARRAY_AGG(product_images.product_image_url) as image_urls")
    )
    .from("products")
    .leftJoin(
      "product_images",
      "products.product_id",
      "product_images.product_id"
    )
    .leftJoin(
      "festivals",
      "products.festival_selected[1]",
      "festivals.festival_id"
    )
    .leftJoin(
      "promotions",
      "promotions.promotion_id",
      "products.promotional_discount_id"
    )
    .leftJoin("nationalities", "products.nationality_id", "nationalities.id")
    .leftJoin(
      "business_details",
      "products.product_business_id",
      "business_details.business_details_id"
    )
    
    .groupBy("products.product_id")
    .groupBy("festivals.festival_id")
    .groupBy("business_details.business_details_id")
    .groupBy("promotions.promotion_id")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .having("business_details_id", "=", business_id);

 


  

  return await query
    .then((value) => {
      return {success: true, details: value};
    })
    .catch((reason) => {
      return {success: false, details: reason};
    });
};

// Get food sample by ID helper function
const getProductById = async (id) => {
  return await db("products")
    .where("product_id", id)
    .first()
    .leftJoin(
      "business_details",
      "products.product_business_id",
      "business_details.business_details_id"
    )
    .leftJoin(
      "tasttlig_users",
      "business_details.business_details_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .then((value) => {
      if (!value) {
        return {success: false, message: "No food sample found."};
      }

      return {success: true, food_sample: value};
    })
    .catch((error) => {
      return {success: false, message: error};
    });
};

module.exports = {
  createNewProduct,
  getAllProductsInFestival,
  getAllUserProducts,
  getAllBusinessProducts,
  getProductById,
  createNewProductFromKodidi,
};
