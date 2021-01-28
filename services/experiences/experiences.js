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
      "experiences.experience_festival_id",
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
    .having("experiences.experience_festival_id", "=", festival_id)
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

module.exports = {
  createNewExperience,
  getExperiencesInFestival,
};
