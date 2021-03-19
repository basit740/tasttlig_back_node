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

const addServiceToFestival = async (festival_id, service_id) => {
  try {
    await db.transaction(async (trx) => {
      console.log("serviceId", service_id);
      let query = await db
        .select("services.*")
        .from("services")
        .where("service_id", "=", service_id);
      console.log(query);
      if (query[0].service_festival_id) {
        const db_service = await trx("services")
          .where({ service_id })
          .update({
            service_festival_id: trx.raw(
              "array_append(service_festival_id, ?)",
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
      } else {
        const db_service = await trx("services")
          .where({ service_id })
          .update({
            service_festival_id: [festival_id],
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

// Get services in festival helper function
const getServicesInFestival = async (festival_id, filters, keyword) => {
  let query = db
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
    .having("services.service_festival_id", "@>", [festival_id]);

  let orderByArray = [];
  if (filters.price) {
    if (filters.price === "lowest_to_highest") {
      orderByArray.push({ column: "services.service_price", order: "asc" });
      //query.orderBy("products.product_price", "asc")
    } else if (filters.price === "highest_to_lowest") {
      orderByArray.push({ column: "services.service_price", order: "desc" });
      //query.orderBy("services.service_price", "desc")
    }
  }
  if (filters.quantity) {
    if (filters.quantity === "lowest_to_highest") {
      orderByArray.push({ column: "services.service_capacity", order: "asc" });
    } else if (filters.quantity === "highest_to_lowest") {
      orderByArray.push({ column: "services.service_capacity", order: "desc" });
    }
  }

  if (filters.price || filters.quantity) {
    query.orderBy(orderByArray);
  }
  if (filters.size) {
    if (filters.size === "bite_size") {
      query.having("services.service_size_scope", "=", "Bite Size");
    } else if (filters.size === "quarter") {
      query.having("services.service_size_scope", "=", "Quarter");
    } else if (filters.size === "half") {
      query.having("services.service_size_scope", "=", "Half");
    } else if (filters.size === "full") {
      query.having("services.service_size_scope", "=", "Full");
    }
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
                //"main.business_name, " +
                //"main.business_city, " +
                "main.service_name, " +
                "main.service_capacity, " +
                "main.service_price, " +
                "main.service_size_scope, " +
                "main.service_description)) as search_text"
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
      return { success: false, details: reason };
    });
};

//service details for dashboard
const getUserServiceDetails = async (user_id) => {
  return await db
    .select(
      "services.*",
      db.raw("ARRAY_AGG(service_images.service_image_url) as image_urls"),
      "nationalities.country"
    )
    .from("service_images")
    .rightJoin("services", "service_images.service_id", "services.service_id")
    .leftJoin(
      "nationalities",
      "services.service_nationality_id",
      "nationalities.id"
    )
    .groupBy("services.service_id")
    .groupBy("services.service_nationality_id")
    .groupBy("nationalities.id")
    .having("services.service_user_id", "=", Number(user_id))
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

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
      "nationalities.nationality",
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
    .leftJoin(
      "nationalities",
      "services.service_nationality_id",
      "nationalities.id"
    )
    .groupBy("services.service_id")
    .groupBy("business_details.business_name")
    .groupBy("business_details.business_address_1")
    .groupBy("business_details.business_address_2")
    .groupBy("business_details.city")
    .groupBy("business_details.state")
    .groupBy("business_details.zip_postal_code")
    .groupBy("business_details.business_details_user_id")
    .groupBy("nationalities.nationality")
    .having("business_details.business_details_user_id", "=", Number(user_id))
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
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

const deleteServicesFromUser = async (user_id, delete_items) => {
  try {
    for (let item of delete_items) {
      await db.transaction(async (trx) => {
        const serviceImagesDelete = await trx("service_images")
          .where({
            service_id: item.service_id,
          })
          .del();
        const serviceDelete = await trx("services")
          .where({
            service_id: item.service_id,
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
const updateService = async (db_user, data) => {
  const { service_images, ...service_update_data } = data;
  let updateData = {};
  console.log("multi", "mmmmm");
  updateData.service_festival_id = data.service_festival_id;
  console.log("multi", data);

  try {
    if (Array.isArray(data.service_id)) {
      await db("services")
        .whereIn("service_id", data.service_id)
        .where((builder) => {
          return builder.where({
            /* service_id, */
            service_user_id: db_user.tasttlig_user_id,
          });
        })
        .update(updateData);

      /* if (service_images && service_images.length) {
        await db("service_images").whereIn("service_id", service_id).del();

        await db("service_images").insert(
          service_images.map((image_url) => ({
            service_id,
            service_image_url: image_url,
          }))
        );
      } */

      return { success: true };
    } else {
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
            service_image_url: image_url,
          }))
        );
      }

      return { success: true };
    }
  } catch (error) {
    return { success: false, details: error };
  }
};

// Delete service helper function
const deleteService = async (user_id, service_id) => {
  if (Array.isArray(service_id)) {
    return await db("service_images")
      .whereIn("service_id", service_id)
      .del()
      .then(async () => {
        await db("services")
          .where({
            /* service_id, */
            service_user_id: user_id,
          })
          .whereIn("service_id", service_id)
          .del();
        return { success: true };
      })
      .catch((reason) => {
        return { success: false, details: reason };
      });
  } else {
    return await db("service_images")
      .where({
        service_id,
      })
      .del()
      .then(async () => {
        await db("services")
          .where({
            service_id,
            service_user_id: user_id,
          })
          .del();
        return { success: true };
      })
      .catch((reason) => {
        return { success: false, details: reason };
      });
  }
};

module.exports = {
  createNewService,
  getServicesInFestival,
  addServiceToFestival,
  getUserServiceDetails,
  getServicesFromUser,
  findService,
  deleteServicesFromUser,
  claimService,
  updateService,
  deleteService,
};
