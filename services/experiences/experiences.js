"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

// Create experience helper function
const createNewExperience = async (
  user_details_from_db,
  experience_information,
  experience_images
) => {
  try {
    await db.transaction(async (trx) => {
      const db_experience = await trx("experiences")
        .insert(experience_information)
        .returning("*");

      if (!db_experience) {
        return { success: false, details: "Inserting new experience failed." };
      }

      const images = experience_images.map((experience_image) => ({
        experience_id: db_experience[0].experience_id,
        experience_image_url: experience_image,
      }));

      await trx("experience_images").insert(images);

      // Food sample created confirmation email
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: user_details_from_db.user.email,
        bcc: ADMIN_EMAIL,
        subject: `[Tasttlig] New Experience Created`,
        template: "new_food_sample",
        context: {
          title: experience_information.experience_name,
          status: experience_information.experience_status,
        },
      });
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Get experiences in festival helper function
const getExperiencesInFestival = async (festival_id) => {
  return await db
    .select(
      "experiences.*",
      "business_details.business_name",
      "business_details.business_address_1",
      "business_details.business_address_2",
      "business_details.city",
      "business_details.state",
      "business_details.zip_postal_code",
      db.raw("ARRAY_AGG(experience_images.experience_image_url) as image_urls")
    )
    .from("experiences")
    .leftJoin(
      "experience_images",
      "experiences.experience_id",
      "experience_images.experience_id"
    )
    .leftJoin(
      "festivals",
      "experiences.festival_selected[1]",
      "festivals.festival_id"
    )
    .leftJoin(
      "business_details",
      "experiences.experience_business_id",
      "business_details.business_details_id"
    )
    .groupBy("experiences.experience_id")
    .groupBy("business_details.business_name")
    .groupBy("business_details.business_address_1")
    .groupBy("business_details.business_address_2")
    .groupBy("business_details.city")
    .groupBy("business_details.state")
    .groupBy("business_details.zip_postal_code")
    .having("experiences.festival_selected", "@>", [festival_id])
    .then((value) => {
      console.log("value", value);
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log("reason", reason);
      return { success: false, details: reason };
    });
};

// Find experience helper function
const findExperience = async (experience_id) => {
  return await db
    .select("experiences.*")
    .from("experiences")
    .where("experiences.experience_id", "=", experience_id)
    .first()
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// Claim experience helper function
const claimExperience = async (db_user, experience_id) => {
  try {
    await db.transaction(async (trx) => {
      const db_experience = await trx("experiences")
        .where({ experience_id })
        .update({
          experience_user_guest_id: trx.raw(
            "array_append(experience_user_guest_id, ?)",
            [db_user.tasttlig_user_id]
          ),
        })
        .returning("*");

      if (!db_experience) {
        return {
          success: false,
          details: "Inserting new experience guest failed.",
        };
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

module.exports = {
  createNewExperience,
  getExperiencesInFestival,
  findExperience,
  claimExperience,
};
