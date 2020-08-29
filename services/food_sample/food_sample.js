"use strict";

const db = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const user_role_manager = require("../profile/user_roles_manager");
const jwt = require("jsonwebtoken");

const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const SITE_BASE = process.env.SITE_BASE;

const createNewFoodSample = async (
  db_user,
  food_sample_details,
  food_sample_images,
  createdByAdmin
) => {
  try {
    await db.transaction(async trx => {
      // food_sample_details.status = "INACTIVE";
      // food_sample_details.food_ad_code = Math.random().toString(36).substring(2, 4) + Math.random().toString(36).substring(2, 4);
      // let user_role_object = user_role_manager.createRoleObject(db_user.role);
      // if (
      //   user_role_object.includes("HOST") &&
      //   db_user.is_participating_in_festival
      // ) {
      //   food_sample_details.status = "ACTIVE";
      // }
      food_sample_details.status = "ACTIVE";
      const db_food_sample = await trx("food_samples")
        .insert(food_sample_details)
        .returning("*");
      if (!db_food_sample) {
        return { success: false, details: "Inserting new Food Sample failed" };
      }
      const images = food_sample_images.map(food_sample_image => ({
        food_sample_id: db_food_sample[0].food_sample_id,
        image_url: food_sample_image
      }));
      await trx("food_sample_images").insert(images);

      if (createdByAdmin) {
        // Email to confirm the new experience by hosts
        jwt.sign(
          {
            id: db_food_sample[0].food_sample_id,
            user_id: db_food_sample[0].food_sample_creater_user_id
          },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "3d"
          },
          async (err, emailToken) => {
            try {
              const url = `${SITE_BASE}/review-food-sample/${db_food_sample[0].food_sample_id}/${emailToken}`;
              await Mailer.sendMail({
                to: db_user.email,
                subject: `[Tasttlig] Review Food sample "${food_sample_details.title}"`,
                template: "review_food_sample",
                context: {
                  title: food_sample_details.title,
                  url_review_food_sample: url
                }
              });
            } catch (err) {
              return {
                success: false,
                details: err.message
              };
            }
          }
        );
      } else {
        // Email to user on submitting the request to upgrade
        await Mailer.sendMail({
          to: db_user.email,
          bcc: ADMIN_EMAIL,
          subject: `[Tasttlig] New Food Sample Created`,
          template: "new_sample",
          context: {
            first_name: db_user.first_name,
            last_name: db_user.last_name,
            title: food_sample_details.title,
            status: food_sample_details.status
          }
        });
      }
    });
    return { success: true, details: "success" };
  } catch (err) {
    return { success: false, details: err.message };
  }
};

const getAllUserFoodSamples = async (
  user_id,
  operator,
  status,
  requestByAdmin
) => {
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
    .groupBy("nationalities.alpha_2_code");

  if (!requestByAdmin) {
    query = query
      .having("food_sample_creater_user_id", "=", user_id)
      .having("food_samples.status", operator, status);
  } else {
    query = query.having("food_samples.status", operator, status);
  }
  return await query
    .then(value => {
      return { success: true, details: value };
    })
    .catch(reason => {
      return { success: false, details: reason };
    });
};

const updateFoodSample = async (
  db_user,
  food_sample_id,
  food_sample_update_data,
  updatedByAdmin
) => {
  if (!food_sample_update_data.status) {
    // let user_role_object = user_role_manager.createRoleObject(db_user.role);
    // if (
    //   user_role_object.includes("HOST") &&
    //   db_user.is_participating_in_festival &&
    //   !updatedByAdmin
    // ) {
    //   food_sample_update_data.status = "ACTIVE";
    // } else {
    //   food_sample_update_data.status = "INACTIVE";
    // }
    food_sample_update_data.status = "ACTIVE";
  }
  return await db("food_samples")
    .where(builder => {
      if (updatedByAdmin) {
        return builder.where({
          food_sample_id: food_sample_id
        });
      } else {
        return builder.where({
          food_sample_id: food_sample_id,
          food_sample_creater_user_id: db_user.tasttlig_user_id
        });
      }
    })
    .update(food_sample_update_data)
    .then(() => {
      return { success: true };
    })
    .catch(reason => {
      return { success: false, details: reason };
    });
};

const deleteFoodSample = async (user_id, food_sample_id) => {
  return await db("food_samples")
    .where({
      food_sample_id: food_sample_id,
      food_sample_creater_user_id: user_id
    })
    .del()
    .then(() => {
      return { success: true };
    })
    .catch(reason => {
      return { success: false, details: reason };
    });
};

const getAllFoodSamples = async (operator, status, keyword, currentPage, food_ad_code, filters) => {
  let query = db
    .select(
      "food_samples.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
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

  if (filters.startDate) {
    query.whereRaw(
      "cast(concat(food_samples.start_date, ' ', food_samples.start_time) as date) >= ?",
      [filters.startDate]
    );
  }

  if (food_ad_code) {
    query.where('food_ad_code', '=', food_ad_code)
  }

  if (keyword) {
    query = db.select('*')
      .from(db.select('main.*',
        db.raw(
          "to_tsvector(main.title) " +
          "|| to_tsvector(main.description) " +
          "|| to_tsvector(main.first_name) " +
          "|| to_tsvector(main.last_name) " +
          "as search_text"))
        .from(query.as('main'))
        .as('main'))
      .where(db.raw(`main.search_text @@ plainto_tsquery('${keyword}')`))
  }

  query = query.paginate({
        perPage: 6,
        isLengthAware: true,
        currentPage: currentPage
      })
  
  return await query
    .then(value => {
      return { success: true, details: value };
    })
    .catch(reason => {
      return { success: false, details: reason };
    });
};

const getFoodSample = async food_sample_id => {
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
      return { success: true, details: value };
    })
    .catch(reason => {
      return { success: false, details: reason };
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
      food_sample_creater_user_id: food_sample_creator_user_id
    })
    .update(food_sample_update_data)
    .returning("*")
    .then(value => {
      if (food_sample_update_data.status === "ACTIVE") {
        Mailer.sendMail({
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
      return { success: true };
    })
    .catch(reason => {
      return { success: false, details: reason };
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
      return { success: true, nationalities: value };
    })
    .catch(err => {
      return { success: false, details: err };
    });
};

const getFoodSampleById = async id => {
  return await db("food_samples")
    .where("food_sample_id", id)
    .first()
    .then(value => {
      if (!value) {
        return { success: false, message: "No food sample found." };
      }
      return { success: true, food_sample: value };
    })
    .catch(error => {
      return { success: false, message: error };
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
