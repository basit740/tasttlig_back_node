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
      console.log(service_information)
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
      "business_details.business_name",
      "business_details.business_address_1",
      "business_details.business_address_2",
      "business_details.city",
      "business_details.state",
      "business_details.zip_postal_code",
      db.raw("ARRAY_AGG(service_images.service_image_url) as image_urls")
    )
    .from("services")
    .leftJoin(
      "service_images",
      "services.service_id",
      "service_images.service_id"
    )
    .join(
      "festivals",
      "services.service_festival_id[1]",
      "festivals.festival_id"
    )
    .leftJoin(
      "business_details",
      "services.service_business_id",
      "business_details.business_details_id"
    )
    .groupBy("services.service_id")
    .groupBy("business_details.business_name")
    .groupBy("business_details.business_address_1")
    .groupBy("business_details.business_address_2")
    .groupBy("business_details.city")
    .groupBy("business_details.state")
    .groupBy("business_details.zip_postal_code")
    .having("services.service_festival_id", "@>", [festival_id])
    .then((value) => {
      console.log("service",value)
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log("service",reason)
      return { success: false, details: reason };
    });
};

//service details for dashboard
const getUserServiceDetails = async (user_id) => {
  return await db
  .select(
    "services.*",
    "service_images.service_image_id",
    db.raw("ARRAY_AGG(service_images.service_image_url) as image_urls"),
    "nationalities.country"
    )
    .from("service_images")
    .rightJoin(
    "services",
    "service_images.service_id",
    "services.service_id",
    )
    .leftJoin(
    "nationalities",
    "services.service_nationality_id",
    "nationalities.id"
    )
    .groupBy("service_images.service_image_id")
    .groupBy("services.service_id")
    .groupBy("services.service_nationality_id")
    .groupBy("nationalities.id")
    .having("services.service_user_id", "=", Number(user_id))
    .then((value) => {console.log('val',value);
      return { success: true, details: value };
    })
    .catch((reason) => {console.log('reas',reason);
      return { success: false, details: reason };
    });
}

const getServicesFromUser = async (user_id) => {

  return await db
    .select(
      "services.*",
      "business_details.business_name",
      "business_details.business_address_1",
      "business_details.business_address_2",
      "business_details.city",
      "business_details.state",
      "business_details.zip_postal_code",
      db.raw("ARRAY_AGG(service_images.service_image_url) as image_urls")
    )
    .from("services")
    .leftJoin(
      "service_images",
      "services.service_id",
      "service_images.service_id"
    )
    .leftJoin(
      "business_details",
      "services.service_business_id",
      "business_details.business_details_id"
    )
    .groupBy("services.service_id")
    .groupBy("business_details.business_name")
    .groupBy("business_details.business_address_1")
    .groupBy("business_details.business_address_2")
    .groupBy("business_details.city")
    .groupBy("business_details.state")
    .groupBy("business_details.zip_postal_code")
    .groupBy("business_details.business_details_user_id")
    .having("business_details.business_details_user_id", "=", Number(user_id))
    .then((value) => {
      console.log(value);
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log(reason);
      return { success: false, details: reason };
    });
};
// Find service helper function
const findService = async (service_id) => {
  return await db
    .select("services.*")
    .from("services")
    .where("services.service_id", "=", service_id)
    .first()
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// Claim service helper function
const claimService = async (db_user, service_id) => {
  try {
    await db.transaction(async (trx) => {
      const db_service = await trx("services")
        .where({ service_id })
        .update({
          service_user_guest_id: trx.raw(
            "array_append(service_user_guest_id, ?)",
            [db_user.tasttlig_user_id]
          ),
        })
        .returning("*");

      if (!db_service) {
        return {
          success: false,
          details: "Inserting new service guest failed.",
        };
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};
// Update service helper function
const updateService = async (
  db_user,
  service_id,
  data,
) => {
  const { service_images, ...service_update_data } = data;

  try {
    await db("services")
      .where((builder) => {
          return builder.where({
            service_id,
            service_user_id: db_user.tasttlig_user_id,
          });
      })
      .update(service_update_data);

    if (service_images && service_images.length) {
      await db("service_images").where("service_id", service_id).del();

      await db("service_images").insert(
        service_images.map((image_url) => ({
          service_id,
          "service_image_url": image_url,
        }))
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false, details: error };
  }
};

module.exports = {
  createNewService,
  getServicesInFestival,
  getUserServiceDetails,
  getServicesFromUser,
  findService,
  claimService,
  updateService,
};
