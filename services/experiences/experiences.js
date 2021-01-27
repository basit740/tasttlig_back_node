"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const jwt = require("jsonwebtoken");
const { setAddressCoordinates } = require("../geocoder");

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const SITE_BASE = process.env.SITE_BASE;

// Create an experience helper function
const createNewExperience = async (
  db_user,
  experience_information,
  experience_images,
  createdByAdmin
) => {
  try {
    await db.transaction(async (trx) => {
      let user_role_object = db_user.role;
      console.log(experience_information);
      if (user_role_object.includes("HOST")) {
        experience_information.experience_status = "ACTIVE";
      }
      const db_experience = await trx("experiences")
        .insert(experience_information)
        .returning("*");
      if (!db_experience) {
        return { success: false, details: "Inserting new experience failed." };
      }
      console.log(experience_images);
      const images = experience_images.map((experience_image) => ({
        experience_id: db_experience[0].experience_id,
        experience_image_url: experience_image,
      }));

      await trx("experience_images").insert(images);
      console.log("hello");
      if (createdByAdmin) {
        // Email to review the food sample from the owner
        jwt.sign(
          {
            id: db_experience[0].experience_id,
            user_id: db_experience[0].experience_business_id,
          },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "3d",
          },
          async (err, emailToken) => {
            try {
              const url = `${SITE_BASE}/review-food-sample/${db_experience[0].experience_id}/${emailToken}`;

              await Mailer.sendMail({
                from: process.env.SES_DEFAULT_FROM,
                to: db_user.email,
                subject: `[Tasttlig] Review Experience "${experience_information.experience_name}"`,
                template: "review_food_sample",
                context: {
                  title: experience_information.experience_name,
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
      } else {
        // Food sample created confirmation email
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: db_user.email,
          bcc: ADMIN_EMAIL,
          subject: `[Tasttlig] New Experience Created`,
          template: "new_food_sample",
          context: {
            title: experience_information.experience_name,
            status: experience_information.experience_status,
          },
        });
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

module.exports = {
  createNewExperience,
};
