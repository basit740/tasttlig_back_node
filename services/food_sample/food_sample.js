"use strict";

// Libraries
const Food_Sample_Claim_Status = require("../../enums/food_sample_claim_status");
const { db, gis } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const {
  formatTime,
  generateRandomString,
} = require("../../functions/functions");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { setAddressCoordinates } = require("../geocoder");

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const SITE_BASE = process.env.SITE_BASE;

/* Save new food sample to food samples and food sample images tables helper 
function */
const createNewFoodSample = async (
  db_user,
  food_sample_details,
  food_sample_images,
  createdByAdmin
) => {
  try {
    // console.log("data from foodsample service", db_user, food_sample_details)
    await db.transaction(async (trx) => {
      // food_sample_details.status = "INACTIVE";
      food_sample_details.food_ad_code =
        Math.random().toString(36).substring(2, 4) +
        Math.random().toString(36).substring(2, 4);
      let user_role_object = db_user.role;

      if (
        user_role_object.includes("HOST") || createdByAdmin
        
      ) {
        food_sample_details.status = "ACTIVE";
      } 
      else if (
      user_role_object.includes("HOST_PENDING")) {
        food_sample_details.status = "INACTIVE";
      }

      // food_sample_details = await setAddressCoordinates(food_sample_details);
      
      const db_food_sample = await trx("food_samples")
        .insert(food_sample_details)
        .returning("*");

      await trx("food_samples")
        .where({
          food_sample_id: db_food_sample[0].food_sample_id,
        })
        .update({
          original_food_sample_id: db_food_sample[0].food_sample_id,
        });

      if (!db_food_sample) {
        return { success: false, details: "Inserting new food sample failed." };
      }

      const images = food_sample_images.map((food_sample_image) => ({
        food_sample_id: db_food_sample[0].food_sample_id,
        image_url: food_sample_image,
      }));

      await trx("food_sample_images").insert(images);

      if (createdByAdmin) {
        // Email to review the food sample from the owner
        jwt.sign(
          {
            id: db_food_sample[0].food_sample_id,
            user_id: db_food_sample[0].food_sample_creater_user_id,
          },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "3d",
          },
          async (err, emailToken) => {
            try {
              const url = `${SITE_BASE}/review-food-sample/${db_food_sample[0].food_sample_id}/${emailToken}`;

              await Mailer.sendMail({
                from: process.env.SES_DEFAULT_FROM,
                to: db_user.email,
                subject: `[Tasttlig] Review Food sample "${food_sample_details.title}"`,
                template: "review_food_sample",
                context: {
                  title: food_sample_details.title,
                  url_review_food_sample: url,
                },
              });
            } catch (error) {
              return {
                success: false,
                details: error.message,
              };
            }
          }
        );
      } else if (food_sample_details.status === "ACTIVE") {
        // Food sample created confirmation email
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: db_user.email,
          bcc: ADMIN_EMAIL,
          subject: `[Tasttlig] New Food Sample Created`,
          template: "new_food_sample",
          context: {
            title: food_sample_details.title,
            status: food_sample_details.status,
          },
        });
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    // Duplicate key
    if (error.code === 23505) {
      food_sample_details.food_ad_code = generateRandomString(4);

      return createNewFoodSample(
        db_user,
        food_sample_details,
        food_sample_images,
        createdByAdmin
      );
    }

    return { success: false, details: error.message };
  }
};

// Get all user food samples helper function
const getAllUserFoodSamples = async (
  user_id,
  operator,
  status,
  keyword,
  currentPage,
  requestByAdmin = false,
  festival_name = ""
) => {
  const startOfDay = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
  const endOfDay = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
  let query = db
    .select(
      "food_samples.*",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(food_sample_images.image_url) as image_urls"),
      db.raw(
        "(select count(*)::integer from food_sample_claims c where c.food_sample_id=food_samples.food_sample_id and c.status<>? and c.reserved_on between ? and ?) as num_of_claims",
        [Food_Sample_Claim_Status.PENDING, startOfDay, endOfDay]
      )
    )
    .from("food_samples")
    .leftJoin(
      "food_sample_images",
      "food_samples.food_sample_id",
      "food_sample_images.food_sample_id"
    )
    .leftJoin("festivals", "food_samples.festival_id", "festivals.festival_id")
    .leftJoin(
      "nationalities",
      "food_samples.nationality_id",
      "nationalities.id"
    )
    .groupBy("food_samples.food_sample_id")
    .groupBy("festivals.festival_id")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code");

  if (!requestByAdmin) {
    query = query
      .having("food_sample_creater_user_id", "=", user_id)
      .having("food_samples.status", operator, status);
  } else {
    query = query.having("food_samples.status", operator, status);
  }

  if (festival_name !== "") {
    query = query.having("festivals.festival_name", "=", festival_name);
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
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// Get all user food samples not in festival helper function
const getAllUserFoodSamplesNotInFestival = async (
  user_id,
  operator,
  status,
  keyword,
  currentPage,
  requestByAdmin,
  festival_name
) => {
  const food_samples_in_festival = await db
    .select("food_samples.original_food_sample_id")
    .from("food_samples")
    .leftJoin("festivals", "food_samples.festival_id", "festivals.festival_id")
    .where("festivals.festival_name", "=", festival_name)
    .then((db_food_samples) => {
      return db_food_samples.map(
        (db_food_sample) => db_food_sample.original_food_sample_id
      );
    });
  let query = db
    .select(
      "food_samples.*",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(food_sample_images.image_url) as image_urls")
    )
    .from("food_samples")
    .leftJoin(
      "food_sample_images",
      "food_samples.food_sample_id",
      "food_sample_images.food_sample_id"
    )
    .leftJoin(
      "nationalities",
      "food_samples.nationality_id",
      "nationalities.id"
    )
    .groupBy("food_samples.food_sample_id")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .havingNotIn(
      "food_samples.original_food_sample_id",
      food_samples_in_festival
    );

  if (!requestByAdmin) {
    query = query
      .having("food_sample_creater_user_id", "=", user_id)
      .having("food_samples.status", operator, status);
  } else {
    query = query.having("food_samples.status", operator, status);
  }

  return await query
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// Update food sample helper function
const updateFoodSample = async (
  db_user,
  food_sample_id,
  update_data,
  updatedByAdmin
) => {
  const { images, ...food_sample_update_data } = update_data;

  if (!food_sample_update_data.status) {
    // let user_role_object = db_user.role;
    // if (
    //   user_role_object.includes("RESTAURANT") &&
    //   db_user.is_participating_in_festival &&
    //   !updatedByAdmin
    // ) {
    //   food_sample_update_data.status = "ACTIVE";
    // } else {
    //   food_sample_update_data.status = "INACTIVE";
    // }
    food_sample_update_data.status = "ACTIVE";
  }

  try {
    await db("food_samples")
      .where((builder) => {
        if (updatedByAdmin) {
          return builder.where({
            food_sample_id,
          });
        } else {
          return builder.where({
            food_sample_id,
            food_sample_creater_user_id: db_user.tasttlig_user_id,
          });
        }
      })
      .update(food_sample_update_data);

    if (images && images.length) {
      await db("food_sample_images")
        .where("food_sample_id", food_sample_id)
        .del();

      await db("food_sample_images").insert(
        images.map((image_url) => ({
          food_sample_id,
          image_url,
        }))
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false, details: error };
  }
};

// Delete food sample helper function
const deleteFoodSample = async (
  food_sample_id,
  food_sample_creater_user_id
) => {
  return await db("food_samples")
    .where({
      food_sample_id,
      food_sample_creater_user_id,
    })
    .del()
    .then(() => {
      return { success: true };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// Get all food samples helper function
const getAllFoodSamples = async (
  operator,
  status,
  keyword,
  currentPage,
  food_ad_code,
  filters
) => {
  const startOfDay = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
  const endOfDay = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
  let startDate = filters.startDate.substring(0, 10);
  let endDate = filters.endDate.substring(0, 10);
  let startTime = formatTime(filters.startDate);
  let endTime = formatTime(filters.endDate);
  let query = db
    .select(
      "food_samples.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      "business_details.business_name",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(food_sample_images.image_url) as image_urls"),
      db.raw(
        "(select count(*)::integer from food_sample_claims c where c.food_sample_id=food_samples.food_sample_id and c.status<>? and c.reserved_on between ? and ?) as num_of_claims",
        [Food_Sample_Claim_Status.PENDING, startOfDay, endOfDay]
      )
    )
    .from("food_samples")
    .leftJoin(
      "food_sample_images",
      "food_samples.food_sample_id",
      "food_sample_images.food_sample_id"
    )
    .leftJoin(
      "tasttlig_users",
      "food_samples.food_sample_creater_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .leftJoin(
      "business_details",
      "food_samples.food_sample_creater_user_id",
      "business_details.business_details_user_id"
    )
    .leftJoin(
      "nationalities",
      "food_samples.nationality_id",
      "nationalities.id"
    )
    .leftJoin("festivals", "food_samples.festival_id", "festivals.festival_id")
    .groupBy("food_samples.food_sample_id")
    .groupBy("tasttlig_users.first_name")
    .groupBy("tasttlig_users.last_name")
    .groupBy("business_details.business_name")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .having("food_samples.status", operator, status);

  if (filters.nationalities && filters.nationalities.length) {
    query.whereIn("nationalities.nationality", filters.nationalities);
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

  if (filters.startDate) {
    query
      // .whereRaw(
      //   "cast(concat(food_samples.start_date, ' ', food_samples.start_time) as date) >= ?",
      //   [filters.startDate]
      // );
      .where("food_samples.start_date", ">=", startDate)
      .andWhere("food_samples.start_time", ">=", startTime);
  }

  if (filters.endDate) {
    query
      // .whereRaw(
      //   "cast(concat(food_samples.end_date, ' ', food_samples.end_time) as date) <= ?",
      //   [filters.endDate]
      // );
      .where("food_samples.end_date", "<=", endDate)
      .andWhere("food_samples.end_time", "<=", endTime);
  }

  if (filters.quantity) {
    query.where("food_samples.quantity", ">=", filters.quantity);
  }

  if (food_ad_code) {
    query.where("food_ad_code", "=", food_ad_code);
  }

  if (filters.festival_name) {
    query.where("festival_name", "=", filters.festival_name);
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
// Get all food samples in festival helper function
const getAllFoodSamplesInFestival = async (
  operator,
  status,
  keyword,
  //currentPage,
  //food_ad_code,
  filters,
  festival_id
) => {
  const startOfDay = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
  const endOfDay = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
  let startDate
  let endDate
  let startTime
  let endTime
  if (filters.startDate && filters.endDate && filters.startTime && filters.endDate) {
     startDate = filters.startDate.substring(0, 10);
     endDate = filters.endDate.substring(0, 10);
     startTime = formatTime(filters.startDate);
     endTime = formatTime(filters.endDate);
  }
  let query = db
    .select(
      "food_samples.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      "business_details.business_name",
      "business_details.business_details_id",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(food_sample_images.image_url) as image_urls"),
/*       db.raw(
        "(select count(*)::integer from food_sample_claims c where c.food_sample_id=food_samples.food_sample_id and c.status<>? and c.reserved_on between ? and ?) as num_of_claims",
        [Food_Sample_Claim_Status.PENDING, startOfDay, endOfDay]
      ) */
    )
    .from("food_samples")
    .leftJoin(
      "food_sample_images",
      "food_samples.food_sample_id",
      "food_sample_images.food_sample_id"
    )
    .leftJoin(
      "tasttlig_users",
      "food_samples.food_sample_creater_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .leftJoin(
      "business_details",
      "food_samples.food_sample_creater_user_id",
      "business_details.business_details_user_id"
    )
    .leftJoin(
      "nationalities",
      "food_samples.nationality_id",
      "nationalities.id"
    )
    .leftJoin(
      "festivals", 
      "food_samples.festival_selected[1]", "festivals.festival_id"
      )
    .groupBy("food_samples.food_sample_id")
    .groupBy("tasttlig_users.first_name")
    .groupBy("tasttlig_users.last_name")
    .groupBy("business_details.business_name")
    .groupBy("business_details.business_details_id")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .groupBy("festivals.festival_id")
    .having("food_samples.status", operator, status)
    .having("food_samples.festival_selected", "@>", [festival_id])

    let orderByArray = []
  if (filters.price) {


    if (filters.price === "lowest_to_highest") {
      //console.log("lowest to highest")
      orderByArray.push({ column: "food_samples.price", order: "asc" })
      //query.orderBy("products.product_price", "asc")
    } else if (filters.price === "highest_to_lowest") {
      //console.log("highest to lowest");
      orderByArray.push({ column: "food_samples.price", order: "desc" })
      //query.orderBy("products.product_price", "desc")
    }
  }
  if (filters.quantity) {
    if (filters.quantity === "lowest_to_highest") {
      orderByArray.push({ column: "food_samples.quantity", order: "asc" })
    } else if (filters.quantity === "highest_to_lowest") {
      orderByArray.push({ column: "food_samples.quantity", order: "desc" })
    }
  }

  if (filters.price || filters.quantity) {
    query.orderBy(orderByArray);
  }
  if (filters.size) {
    if (filters.size === "bite_size") {
      query.having("food_samples.sample_size", "=", "Bite Size");
    } else if (filters.size === "quarter") {
      query.having("food_samples.sample_size", "=", "Quarter");
    } else if (filters.size === "half") {
      query.having("food_samples.sample_size", "=", "Half");
    } else if (filters.size === "full") {
      query.having("food_samples.sample_size", "=", "Full");
    }
  }

/*   if (filters.nationalities && filters.nationalities.length) {
    query.whereIn("nationalities.nationality", filters.nationalities);
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

  if (filters.startDate) {
    query
      // .whereRaw(
      //   "cast(concat(food_samples.start_date, ' ', food_samples.start_time) as date) >= ?",
      //   [filters.startDate]
      // );
      .where("food_samples.start_date", ">=", startDate)
      .andWhere("food_samples.start_time", ">=", startTime);
  }

  if (filters.endDate) {
    query
      // .whereRaw(
      //   "cast(concat(food_samples.end_date, ' ', food_samples.end_time) as date) <= ?",
      //   [filters.endDate]
      // );
      .where("food_samples.end_date", "<=", endDate)
      .andWhere("food_samples.end_time", "<=", endTime);
  }

  if (filters.quantity) {
    query.where("food_samples.quantity", ">=", filters.quantity);
  }

  //if (food_ad_code) {
    //query.where("food_ad_code", "=", food_ad_code);
  //}

  if (filters.festival_name) {
    query.where("festival_name", "=", filters.festival_name);
  } */

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
                //"main.nationality, " +
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

  return await query
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log("service", reason);
      return { success: false, details: reason };
    });
};

// Get food sample helper function
const getFoodSample = async (food_sample_id) => {
  return await db
    .select(
      "food_samples.*",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      "business_details.business_name",
      db.raw("ARRAY_AGG(food_sample_images.image_url) as image_urls")
    )
    .from("food_samples")
    .leftJoin(
      "food_sample_images",
      "food_samples.food_sample_id",
      "food_sample_images.food_sample_id"
    )
    .leftJoin(
      "nationalities",
      "food_samples.nationality_id",
      "nationalities.id"
    )
    .leftJoin(
      "business_details",
      "food_samples.food_sample_creater_user_id",
      "business_details.business_details_user_id"
    )
    .groupBy("food_samples.food_sample_id")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .groupBy("business_details.business_name")
    .having("food_samples.food_sample_id", "=", food_sample_id)
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// Submit food sample review from admin helper function
const updateReviewFoodSample = async (
  food_sample_id,
  food_sample_creater_user_id,
  food_sample_update_data
) => {
  return await db("food_samples")
    .where({
      food_sample_id,
      food_sample_creater_user_id,
    })
    .update(food_sample_update_data)
    .returning("*")
    .then((value) => {
      if (food_sample_update_data.status === "ACTIVE") {
        Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: ADMIN_EMAIL,
          subject: `[Tasttlig] Food sample "${value[0].title}" has been accepted`,
          template: "accept_food_sample",
          context: {
            title: value[0].title,
            review_food_sample_reason:
              food_sample_update_data.review_food_sample_reason,
          },
        });
      } else {
        Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: ADMIN_EMAIL,
          subject: `[Tasttlig] Food sample "${value[0].title}" has been rejected`,
          template: "reject_food_sample",
          context: {
            title: value[0].title,
            review_food_sample_reason:
              food_sample_update_data.review_food_sample_reason,
          },
        });
      }
    })
    .then(() => {
      return { success: true };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// Get food sample nationalities helper function
const getDistinctNationalities = async (
  operator,
  status,
  keyword,
  alreadySelectedNationalityList
) => {
  let query = db
    .select("nationalities.nationality")
    .from("food_samples")
    .leftJoin(
      "food_sample_images",
      "food_samples.food_sample_id",
      "food_sample_images.food_sample_id"
    )
    .leftJoin(
      "nationalities",
      "food_samples.nationality_id",
      "nationalities.id"
    )
    .groupBy("food_samples.food_sample_id")
    .groupBy("nationalities.nationality")
    .havingNotIn("nationalities.nationality", alreadySelectedNationalityList)
    .distinct();

  query = query.having("food_samples.status", operator, status);

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
                "main.nationality" +
                ")) as search_text"
            )
          )
          .from(query.as("main"))
          .as("main")
      )
      .orderBy("rank", "desc");

      console.log(query)
  }

  return await query
    .then((value) => {
      return { success: true, nationalities: value };
    })
    .catch((error) => {
      return { success: false, details: error };
    });
};

// Get food sample by ID helper function
const getFoodSampleById = async (id) => {
  return await db("food_samples")
    .where("food_sample_id", id)
    .first()
    .leftJoin(
      "tasttlig_users",
      "food_samples.food_sample_creater_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .leftJoin(
      "business_details",
      "food_samples.food_sample_creater_user_id",
      "business_details.business_details_user_id"
    )
    .then((value) => {
      if (!value) {
        return { success: false, message: "No food sample found." };
      }

      return { success: true, food_sample: value };
    })
    .catch((error) => {
      return { success: false, message: error };
    });
};

// Add food sample to festival helper function
const addFoodSampleToFestival = async (
  food_sample_id,
  food_sample_creator_user_id,
  food_sample_creator_user_email,
  festival_name,
  requestByAdmin
) => {
  const db_festival = await db("festivals")
    .where("festival_name", festival_name)
    .first();
  const db_food_sample = await db("food_samples")
    .where("food_samples.food_sample_id", food_sample_id)
    .first();
  const db_food_sample_images = await db("food_sample_images").where(
    "food_sample_images.food_sample_id",
    food_sample_id
  );

  const insertData = {
    ...db_food_sample,
    festival_id: db_festival.festival_id,
    original_food_sample_id: food_sample_id,
    start_date: db_festival.festival_start_date,
    end_date: db_festival.festival_end_date,
    food_ad_code: generateRandomString(4),
  };
  delete insertData.food_sample_id;

  return db("food_samples")
    .insert(insertData)
    .returning("*")
    .then((new_food_sample) => {
      let new_food_sample_images = [];

      db_food_sample_images.map((new_food_sample_image) => {
        new_food_sample_images.push({
          food_sample_id: new_food_sample[0].food_sample_id,
          image_url: new_food_sample_image.image_url,
        });
      });

      return db("food_sample_images")
        .insert(new_food_sample_images)
        .then(() => {
          if (!requestByAdmin) {
            Mailer.sendMail({
              from: process.env.SES_DEFAULT_FROM,
              to: food_sample_creator_user_email,
              subject: `[Tasttlig] Food sample "${db_food_sample.title}" is part of festival`,
              template: "food_sample/new_food_sample_to_festival",
              context: {
                title: db_food_sample.title,
              },
            });
          }
        });
    })
    .then(() => {
      return { success: true };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

const getNationalities = async (keyword) => {
  try {
    console.log(keyword)
    return await db("nationalities")
    .select("nationality")
    .whereRaw("nationality LIKE ?", [keyword + '%'])
    // .having("nationality", "LIKE", `$keyword%`)
    .returning("*")
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log(reason)
      return { success: false, details: reason };
    });
  } catch (error) {
    return { success: false, message: error };
  }
};

const deleteFoodSamplesFromUser = async(user_id, delete_items) => {
  try {
    for (let item of delete_items) {
      await db.transaction(async(trx) => {
         const productImagesDelete = await trx("food_sample_images")
         .where({
           food_sample_id: item.food_sample_id
         })
         .del() 
        const foodSampleDelete = await trx("food_samples")
        .where({
          food_sample_id: item.food_sample_id,
        })
        .del()
        .then(() => {
          return { success: true };
        })
        .catch((reason) => {
          console.log(reason);
          return { success: false, details: reason };
        });
      })
    }
  } catch(error) {
    return { success: false, details: error}
  }
}

module.exports = {
  createNewFoodSample,
  getAllUserFoodSamples,
  updateFoodSample,
  deleteFoodSample,
  getAllFoodSamples,
  getAllFoodSamplesInFestival,
  getFoodSample,
  updateReviewFoodSample,
  getDistinctNationalities,
  getFoodSampleById,
  addFoodSampleToFestival,
  getAllUserFoodSamplesNotInFestival,
  getNationalities,
  deleteFoodSamplesFromUser
};
