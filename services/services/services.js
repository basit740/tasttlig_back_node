"use strict";

// Libraries
const { db} = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const jwt = require("jsonwebtoken");
const { setAddressCoordinates } = require("../geocoder");

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const SITE_BASE = process.env.SITE_BASE;

// Create an experience helper function
const createNewService = async (
  db_user,
  service_information,
  service_images,
  createdByAdmin
) => {
  try {
    await db.transaction(async (trx) => {
      let user_role_object = db_user.role;
      console.log(service_information);
      if (user_role_object.includes("HOST")) {
        service_information.service_status = "ACTIVE";
      }
      const db_service = await trx("services")
        .insert(service_information)
        .returning("*");
      if (!db_service) {
        return { success: false, details: "Inserting new experience failed." };
      }
      console.log(service_images)
      const images = service_images.map((service_image) => ({
        service_id: db_service[0].service_id,
        service_image_url: service_image,
      }));

      await trx("service_images").insert(images);
      console.log("hello")
      if (createdByAdmin) {
        // Email to review the food sample from the owner
        jwt.sign(
          {
            id: db_service[0].service_id,
            user_id: db_service[0].service_business_id,
          },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "3d",
          },
          async (err, emailToken) => {
            try {
              const url = `${SITE_BASE}/review-food-sample/${db_service[0].service_id}/${emailToken}`;

              await Mailer.sendMail({
                from: process.env.SES_DEFAULT_FROM,
                to: db_user.email,
                subject: `[Tasttlig] Review service "${service_information.service_name}"`,
                template: "review_food_sample",
                context: {
                  title: service_information.service_name,
                  url_review_service: url,
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
          subject: `[Tasttlig] New service Created`,
          template: "new_food_sample",
          context: {
            title: service_information.service_name,
            status: service_information.service_status,
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
  createNewService
};