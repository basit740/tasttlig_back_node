"use strict";

// Libraries
const { db, gis } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const jwt = require("jsonwebtoken");
const { setAddressCoordinates } = require("../geocoder");

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const SITE_BASE = process.env.SITE_BASE;

// Create an experience helper function
const createNewExperience = async (
  db_user,
  experience_details,
  experience_images
) => {
  try {
    await db.transaction(async (trx) => {
      /* experience_details.status = "INACTIVE";
      let user_role_object = db_user.role;

      if (user_role_object.includes("HOST")) {
        experience_details.status = "ACTIVE";
      } */

      /* experience_details = await setAddressCoordinates(
        experience_details,
        true
      ); */
      //experience_details.status = "ACTIVE";
      const db_experience = await trx("experiences")
        .insert(experience_details)
        .returning("*");

      if (!db_experience) {
        return { success: false, details: "Inserting new experience failed." };
      }

      const images = experience_images.map((experience_image) => ({
        experience_id: db_experience[0].experience_id,
        experience_image_url: experience_image,
      }));

      await trx("experience_images").insert(images); //else { // Email to user on submitting the request to upgrade

      /* if (createdByAdmin) {
        // Email to confirm the new experience by hosts
        jwt.sign(
          {
            id: db_experience[0].experience_id,
            user_id: db_experience[0].experience_creator_user_id,
          },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "3d",
          },
          async (err, emailToken) => {
            try {
              const url = `${SITE_BASE}/review-experience/${db_experience[0].experience_id}/${emailToken}`;

              await Mailer.sendMail({
                from: process.env.SES_DEFAULT_FROM,
                to: db_user.email,
                subject: `[Tasttlig] Review Experience "${experience_details.title}"`,
                template: "review_experience",
                context: {
                  title: experience_details.title,
                  url_review_experience: url,
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
      } */ await Mailer.sendMail(
        {
          from: process.env.SES_DEFAULT_FROM,
          to: db_user.user.email,
          bcc: ADMIN_EMAIL,
          subject: `[Tasttlig] New Experience Created`,
          template: "new_experience",
          context: {
            first_name: db_user.user.first_name,
            last_name: db_user.user.last_name,
            title: experience_details.title,
            status: experience_details.status,
          },
        }
      );
      //}
    });

    return { success: true, details: "Success." };
  } catch (error) {
    console.log("*******err", error);
    return { success: false, details: error.message };
  }
};

// Get all experiences helper function
const getAllExperience = async (
  operator,
  status,
  keyword,
  currentPage,
  filters
) => {
  let query = db
    .select(
      "experiences.*",
      "tasttlig_users.phone_number",
      "tasttlig_users.email",
      "business_details.business_name",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(experience_images.image_url) as image_urls")
    )
    .from("experiences")
    .leftJoin(
      "experience_images",
      "experiences.experience_id",
      "experience_images.experience_id"
    )
    .leftJoin(
      "tasttlig_users",
      "experiences.experience_creator_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .leftJoin(
      "business_details",
      "experiences.experience_creator_user_id",
      "business_details.business_details_user_id"
    )
    .leftJoin("nationalities", "experiences.nationality_id", "nationalities.id")
    .groupBy("experiences.experience_id")
    .groupBy("tasttlig_users.phone_number")
    .groupBy("tasttlig_users.email")
    .groupBy("business_details.business_name")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .having("experiences.status", operator, status);

  if (filters.nationalities && filters.nationalities.length) {
    query.whereIn("nationalities.nationality", filters.nationalities);
  }

  if (filters.latitude && filters.longitude) {
    query.select(
      gis
        .distance(
          "experiences.coordinates",
          gis.geography(gis.makePoint(filters.longitude, filters.latitude))
        )
        .as("distanceAway")
    );
    query.where(
      gis.dwithin(
        "experiences.coordinates",
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
                "main.title, " +
                "main.description, " +
                "main.nationality" +
                "main.business_name" +
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

// Get all experiences from user helper function
const getAllUserExperience = async (
  user_id,
  operator,
  status,
  keyword,
  currentPage,
  requestByAdmin,
  festival_id
) => {
  let query = db
    .select(
      "experiences.*",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      "business_details.business_name",
      db.raw("ARRAY_AGG(experience_images.experience_image_url) as image_urls")
    )
    .from("experiences")
    .leftJoin(
      "experience_images",
      "experiences.experience_id",
      "experience_images.experience_id"
    )
    .leftJoin(
      "nationalities",
      "experiences.experience_nationality_id",
      "nationalities.id"
    )
    .leftJoin(
      "business_details",
      "experiences.experience_business_id",
      "business_details.business_details_id"
    )
    .leftJoin(
      "festivals",
      "experiences.festival_selected[1]",
      "festivals.festival_id"
    )
    .groupBy("experiences.experience_id")
    .groupBy("business_details.business_details_id")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .groupBy("festivals.festival_id")
    .groupBy("experiences.festival_selected");

  if (!requestByAdmin) {
    query = query
      .having("experiences.experience_status", operator, status)
      .having(
        "business_details.business_details_user_id",
        "=",
        Number(user_id)
      );
  } else {
    query = query.having("experiences.experience_status", operator, status);
  }

  if (festival_id) {
    query = query.havingRaw(
      "(? != ALL(coalesce(experiences.festival_selected, array[]::int[])))",
      festival_id
    );
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
                "main.experience_name, " +
                "main.experience_description, " +
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
      console.log("value from experience", value);
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log(reason);
      return { success: false, details: reason };
    });
};

// Get all experiences by user id helper function
const getUserExperiencesById = async (user_id) => {
  console.log("functttttttt", user_id);
  return await db
    .select(
      "experiences.*",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(experience_images.experience_image_url) as image_urls")
    )
    .from("experiences")
    .leftJoin(
      "experience_images",
      "experiences.experience_id",
      "experience_images.experience_id"
    )
    .leftJoin(
      "nationalities",
      "experiences.experience_nationality_id",
      "nationalities.id"
    )
    .groupBy("experiences.experience_id")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .having("experiences.experience_business_id", "=", Number(user_id))
    .then((value) => {
      console.log("*******************************", value);
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log("err*******************************", reason);
      return { success: false, details: reason };
    });
};

// Submit experience review from admin helper function
const updateReviewExperience = async (
  experience_id,
  experience_creator_user_id,
  experience_update_data
) => {
  return await db("experiences")
    .where({
      experience_id,
      experience_creator_user_id,
    })
    .update(experience_update_data)
    .returning("*")
    .then((value) => {
      if (experience_update_data.status === "ACTIVE") {
        Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: ADMIN_EMAIL,
          subject: `[Tasttlig] Experience "${value[0].title}" has been accepted`,
          template: "accept_experience",
          context: {
            title: value[0].title,
            review_experience_reason:
              experience_update_data.review_experience_reason,
          },
        });
      } else {
        Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: ADMIN_EMAIL,
          subject: `[Tasttlig] Experience "${value[0].title}" has been rejected`,
          template: "reject_experience",
          context: {
            title: value[0].title,
            review_experience_reason:
              experience_update_data.review_experience_reason,
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

// Update experience helper function
const updateExperience = async (
  db_user,
  experience_id,
  update_data,
  updatedByAdmin
) => {
  const { images, ...experience_update_data } = update_data;

  if (!experience_update_data.status) {
    let user_role_object = db_user.role;

    if (user_role_object.includes("RESTAURANT") && !updatedByAdmin) {
      experience_update_data.status = "ACTIVE";
    } else {
      experience_update_data.status = "INACTIVE";
    }
  }

  try {
    await db("experiences")
      .where((builder) => {
        if (updatedByAdmin) {
          return builder.where({
            experience_id,
          });
        } else {
          return builder.where({
            experience_id,
            experience_creator_user_id: db_user.tasttlig_user_id,
          });
        }
      })
      .update(experience_update_data);

    if (images && images.length) {
      await db("experience_images").where("experience_id", experience_id).del();

      await db("experience_images").insert(
        images.map((image_url) => ({
          experience_id,
          image_url,
        }))
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false, details: error };
  }
};

// Delete experience helper function
const deleteExperience = async (experience_id, experience_creator_user_id) => {
  return await db("experiences")
    .where({
      experience_id,
      experience_creator_user_id,
    })
    .del()
    .then(() => {
      return { success: true };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// Get experience helper function
const getExperience = async (experience_id) => {
  return await db
    .select(
      "experiences.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      "tasttlig_users.email",
      "tasttlig_users.phone_number",
      "business_details.business_name",
      db.raw("ARRAY_AGG(experience_images.image_url) as image_urls")
    )
    .from("experiences")
    .leftJoin(
      "experience_images",
      "experiences.experience_id",
      "experience_images.experience_id"
    )
    .leftJoin(
      "tasttlig_users",
      "experiences.experience_creator_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .leftJoin(
      "business_details",
      "experiences.experience_creator_user_id",
      "business_details.business_details_user_id"
    )
    .groupBy("experiences.experience_id")
    .groupBy("tasttlig_users.first_name")
    .groupBy("tasttlig_users.last_name")
    .groupBy("tasttlig_users.email")
    .groupBy("tasttlig_users.phone_number")
    .groupBy("business_details.business_name")
    .having("experiences.experience_id", "=", experience_id)
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// Get experience nationalities helper function
const getDistinctNationalities = async (operator, status) => {
  return await db("experiences")
    .where("experiences.status", operator, status)
    .leftJoin("nationalities", "experiences.nationality_id", "nationalities.id")
    .pluck("nationalities.nationality")
    .orderBy("nationalities.nationality")
    .distinct()
    .then((value) => {
      return { success: true, nationalities: value };
    })
    .catch((error) => {
      return { success: false, details: error };
    });
};

const addExperienceToFestival = async (festival_id, experience_id) => {
  try {
    await db.transaction(async (trx) => {
      console.log("experienceId", experience_id);
      if (Array.isArray(experience_id)) {
        for (let experience of experience_id) {
          const db_experience = await trx("experiences")
            .where({ experience_id: experience })
            .update({
              festival_selected: trx.raw("array_append(festival_selected, ?)", [
                festival_id,
              ]),
            })
            .returning("*");

          if (!db_experience) {
            return {
              success: false,
              details: "Inserting new product guest failed.",
            };
          }
        }
      } else {
        const db_service = await trx("experiences")
          .where({ experience_id })
          .update({
            festival_selected: trx.raw(
              "array_append(experience_festival_selected, ?)",
              [festival_id]
            ),
          })
          .returning("*");

        if (!db_service) {
          return {
            success: false,
            details: "Inserting new product guest failed.",
          };
        }
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }
};

const deleteFoodExperiences = async (user_id, delete_items) => {
  try {
    for (let item of delete_items) {
      await db.transaction(async (trx) => {
        const ExperienceDelete = await trx("experiences")
          .where({
            experience_id: item.experience_id,
          })
          .del()
          .then(() => {
            return { success: true };
          })
          .catch((reason) => {
            return { success: false, details: reason };
          });
      });
    }
  } catch (error) {
    return { success: false, details: error };
  }
};

module.exports = {
  createNewExperience,
  getAllExperience,
  getAllUserExperience,
  deleteExperience,
  updateReviewExperience,
  updateExperience,
  getExperience,
  getDistinctNationalities,
  addExperienceToFestival,
  getUserExperiencesById,
  deleteFoodExperiences,
};
