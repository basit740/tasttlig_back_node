"use strict";

const Food_Sample_Claim_Status = require("../../enums/food_sample_claim_status");
const {db, gis} = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const {generateRandomString} = require("../../functions/functions");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const {setAddressCoordinates} = require("../geocoder");

const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const SITE_BASE = process.env.SITE_BASE;

const createNewFoodSample = async (
  db_user,
  food_sample_details,
  food_sample_images,
  createdByAdmin
) => {
  try {
    await db.transaction(async (trx) => {
      // food_sample_details.status = "INACTIVE";
      // food_sample_details.food_ad_code = Math.random().toString(36).substring(2, 4) + Math.random().toString(36).substring(2, 4);
      // let user_role_object = db_user.role;
      // if (
      //   user_role_object.includes("RESTAURANT") &&
      //   db_user.is_participating_in_festival
      // ) {
      //   food_sample_details.status = "ACTIVE";
      // }
  
      food_sample_details = await setAddressCoordinates(food_sample_details);

      const db_food_sample = await trx("food_samples")
        .insert(food_sample_details)
        .returning("*");
      if (!db_food_sample) {
        return {success: false, details: "Inserting new Food Sample failed"};
      }
      const images = food_sample_images.map((food_sample_image) => ({
        food_sample_id: db_food_sample[0].food_sample_id,
        image_url: food_sample_image,
      }));
      await trx("food_sample_images").insert(images);

      if (createdByAdmin) {
        // Email to confirm the new experience by hosts
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
            } catch (err) {
              return {
                success: false,
                details: err.message,
              };
            }
          }
        );
      } else if (food_sample_details.status === "ACTIVE") {
        // Email to user on submitting the request to upgrade
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
    return {success: true, details: "success"};
  } catch (err) {
    // duplicate key
    if (err.code === 23505) {
      food_sample_details.food_ad_code = generateRandomString(4)
      return createNewFoodSample(
        db_user,
        food_sample_details,
        food_sample_images,
        createdByAdmin
      )
    }
    return {success: false, details: err.message};
  }
};

const getAllUserFoodSamples = async (
  user_id,
  operator,
  status,
  keyword,
  currentPage,
  requestByAdmin
) => {
  const startOfDay = moment().startOf('day').format("YYYY-MM-DD HH:mm:ss");
  const endOfDay = moment().endOf('day').format("YYYY-MM-DD HH:mm:ss");
  let query = db
    .select(
      "food_samples.*",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(food_sample_images.image_url) as image_urls"),
      db.raw("(select count(*)::integer from food_sample_claims c where c.food_sample_id=food_samples.food_sample_id and c.status<>? and c.reserved_on between ? and ?) as num_of_claims", [Food_Sample_Claim_Status.PENDING, startOfDay, endOfDay])
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
    .groupBy("nationalities.alpha_2_code");

  if (!requestByAdmin) {
    query = query
      .having("food_sample_creater_user_id", "=", user_id)
      .having("food_samples.status", operator, status);
  } else {
    query = query.having("food_samples.status", operator, status);
  }
  
  if (keyword) {
    query = db
      .select(
        "*",
        db.raw("CASE WHEN (phraseto_tsquery('??')::text = '') THEN 0 " +
          "ELSE ts_rank_cd(main.search_text, (phraseto_tsquery('??')::text || ':*')::tsquery) " +
          "END rank", [keyword, keyword])
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
    currentPage: currentPage
  });
  
  return await query
    .then(value => {
      return {success: true, details: value};
    })
    .catch(reason => {
      return {success: false, details: reason};
    });
};

const updateFoodSample = async (
  db_user,
  food_sample_id,
  update_data,
  updatedByAdmin
) => {
  const {
    images,
    ...food_sample_update_data
  } = update_data;

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
            food_sample_id: food_sample_id,
          });
        } else {
          return builder.where({
            food_sample_id: food_sample_id,
            food_sample_creater_user_id: db_user.tasttlig_user_id,
          });
        }
      }).update(food_sample_update_data)

    if(images && images.length) {
      await db("food_sample_images").where("food_sample_id", food_sample_id).del()
      await db("food_sample_images").insert(images.map(m => ({
        food_sample_id,
        image_url: m
      })))
    }

    return {success: true};
  } catch (e) {
    return {success: false, details: e};
  }
};

const deleteFoodSample = async (user_id, food_sample_id) => {
  return await db("food_samples")
    .where({
      food_sample_id: food_sample_id,
      food_sample_creater_user_id: user_id,
    })
    .del()
    .then(() => {
      return {success: true};
    })
    .catch(reason => {
      return {success: false, details: reason};
    });
};

const getAllFoodSamples = async (
  operator,
  status,
  keyword,
  currentPage,
  food_ad_code,
  filters
) => {
  const startOfDay = moment().startOf('day').format("YYYY-MM-DD HH:mm:ss");
  const endOfDay = moment().endOf('day').format("YYYY-MM-DD HH:mm:ss");
  let query = db
    .select(
      "food_samples.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(food_sample_images.image_url) as image_urls"),
      db.raw("(select count(*)::integer from food_sample_claims c where c.food_sample_id=food_samples.food_sample_id and c.status<>? and c.reserved_on between ? and ?) as num_of_claims", [Food_Sample_Claim_Status.PENDING, startOfDay, endOfDay])
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
      "nationalities",
      "food_samples.nationality_id",
      "nationalities.id"
    )
    .groupBy("food_samples.food_sample_id")
    .groupBy("tasttlig_users.first_name")
    .groupBy("tasttlig_users.last_name")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .having("food_samples.status", operator, status);

  if (filters.nationalities && filters.nationalities.length) {
    query.whereIn("nationalities.nationality", filters.nationalities);
  }

  if (filters.latitude && filters.longitude) {
    query.select(gis.distance("food_samples.coordinates", gis.geography(gis.makePoint(filters.longitude, filters.latitude)))
      .as("distanceAway"))
    query.where(gis.dwithin(
      "food_samples.coordinates",
      gis.geography(gis.makePoint(filters.longitude, filters.latitude)),
      filters.radius || 100000));
    query.orderBy("distanceAway", "asc");
  }

  if (filters.startDate) {
    query.whereRaw(
      "cast(concat(food_samples.start_date, ' ', food_samples.start_time) as date) >= ?",
      [filters.startDate]
    );
  }

  if (food_ad_code) {
    query.where("food_ad_code", "=", food_ad_code);
  }
  
  if (keyword) {
    query = db
      .select(
        "*",
        db.raw("CASE WHEN (phraseto_tsquery('??')::text = '') THEN 0 " +
          "ELSE ts_rank_cd(main.search_text, (phraseto_tsquery('??')::text || ':*')::tsquery) " +
          "END rank", [keyword, keyword])
      )
      .from(
        db
          .select(
            "main.*",
            db.raw(
              "to_tsvector(concat_ws(' '," +
              "main.title, " +
              "main.description, " +
              "main.nationality, " +
              "main.first_name, " +
              "main.last_name)) as search_text"
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
    currentPage: currentPage
  })

  return await query
    .then(value => {
      return {success: true, details: value};
    })
    .catch(reason => {
      return {success: false, details: reason};
    });
};

const getFoodSample = async (food_sample_id) => {
  return await db
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
    .having("food_samples.food_sample_id", "=", food_sample_id)
    .then(value => {
      return {success: true, details: value};
    })
    .catch(reason => {
      return {success: false, details: reason};
    });
};

const updateReviewFoodSample = async (
  food_sample_id,
  food_sample_creator_user_id,
  food_sample_update_data
) => {
  return await db("food_samples")
    .where({
      food_sample_id: food_sample_id,
      food_sample_creater_user_id: food_sample_creator_user_id,
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
            food_sample_update_data.review_experience_reason
          }
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
            food_sample_update_data.review_experience_reason
          }
        });
      }
    })
    .then(() => {
      return {success: true};
    })
    .catch(reason => {
      return {success: false, details: reason};
    });
};

const getDistinctNationalities = async (operator, status) => {
  return await db("food_samples")
    .where("food_samples.status", operator, status)
    .leftJoin(
      "nationalities",
      "food_samples.nationality_id",
      "nationalities.id"
    )
    .pluck("nationalities.nationality")
    .orderBy("nationalities.nationality")
    .distinct()
    .then(value => {
      return {success: true, nationalities: value};
    })
    .catch(err => {
      return {success: false, details: err};
    });
};

const getFoodSampleById = async (id) => {
  return await db("food_samples")
    .where("food_sample_id", id)
    .first()
    .leftJoin(
      "tasttlig_users",
      "food_samples.food_sample_creater_user_id",
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
  createNewFoodSample,
  getAllUserFoodSamples,
  updateFoodSample,
  deleteFoodSample,
  getAllFoodSamples,
  getFoodSample,
  updateReviewFoodSample,
  getDistinctNationalities,
  getFoodSampleById
};
