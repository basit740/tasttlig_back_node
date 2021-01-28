"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

// Create service helper function
const createNewService = async (
  user_details_from_db,
  service_information,
  service_images
) => {
  try {
    await db.transaction(async (trx) => {
      const db_service = await trx("services")
        .insert(service_information)
        .returning("*");

      if (!db_service) {
        return { success: false, details: "Inserting new service failed." };
      }

      const images = service_images.map((service_image) => ({
        service_id: db_service[0].service_id,
        service_image_url: service_image,
      }));

      await trx("service_images").insert(images);

      // Food sample created confirmation email
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: user_details_from_db.user.email,
        bcc: ADMIN_EMAIL,
        subject: `[Tasttlig] New Service Created`,
        template: "new_food_sample",
        context: {
          title: service_information.service_name,
          status: service_information.service_status,
        },
      });
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Get services in festival helper function
const getServicesInFestival = async (festival_id) => {
  return await db
    .select(
      "services.*",
      db.raw("ARRAY_AGG(service_images.service_image_url) as image_urls")
    )
    .from("services")
    .leftJoin(
      "service_images",
      "services.service_id",
      "service_images.service_id"
    )
    .leftJoin(
      "festivals",
      "services.service_festival_id",
      "festivals.festival_id"
    )
    .groupBy("services.service_id")
    .having("services.service_festival_id", "=", festival_id)
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

module.exports = {
  createNewService,
  getServicesInFestival,
};
