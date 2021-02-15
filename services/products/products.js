"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

// Create product helper function
const createNewProduct = async (
  user_details_from_db,
  product_information,
  product_images
) => {
  try {
    await db.transaction(async (trx) => {
      const db_product = await trx("products")
        .insert(product_information)
        .returning("*");

      if (!db_product) {
        return { success: false, details: "Inserting new product failed." };
      }

      const images = product_images.map((product_image) => ({
        product_id: db_product[0].product_id,
        product_image_url: product_image,
      }));

      await trx("product_images").insert(images);

      // Food sample created confirmation email
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: user_details_from_db.user.email,
        bcc: ADMIN_EMAIL,
        subject: `[Tasttlig] New Product Created`,
        template: "new_food_sample",
        context: {
          title: product_information.product_name,
          status: product_information.product_status,
        },
      });
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Get products in festival helper function
const getProductsInFestival = async (festival_id) => {

  return await db
    .select(
      "products.*",
      "business_details.business_name",
      "business_details.business_address_1",
      "business_details.business_address_2",
      "business_details.city",
      "business_details.state",
      "business_details.zip_postal_code",
      db.raw("ARRAY_AGG(product_images.product_image_url) as image_urls")
    )
    .from("products")
    .leftJoin(
      "product_images",
      "products.product_id",
      "product_images.product_id"
    )
    .leftJoin(
      "festivals",
      "products.product_festivals_id[0]",
      "festivals.festival_id"
    )
    .leftJoin(
      "business_details",
      "products.product_business_id",
      "business_details.business_details_id"
    )
    .groupBy("products.product_id")
    .groupBy("business_details.business_name")
    .groupBy("business_details.business_address_1")
    .groupBy("business_details.business_address_2")
    .groupBy("business_details.city")
    .groupBy("business_details.state")
    .groupBy("business_details.zip_postal_code")
    .having("products.product_festivals_id[1]", "=", Number(festival_id))
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};
const getProductsFromUser = async (user_id) => {

  return await db
    .select(
      "products.*",
      "business_details.business_name",
      "business_details.business_address_1",
      "business_details.business_address_2",
      "business_details.city",
      "business_details.state",
      "business_details.zip_postal_code",
      db.raw("ARRAY_AGG(product_images.product_image_url) as image_urls")
    )
    .from("products")
    .leftJoin(
      "product_images",
      "products.product_id",
      "product_images.product_id"
    )
    .leftJoin(
      "business_details",
      "products.product_business_id",
      "business_details.business_details_id"
    )
    .groupBy("products.product_id")
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

// Find product helper function
const findProduct = async (product_id) => {
  return await db
    .select("products.*")
    .from("products")
    .where("products.product_id", "=", product_id)
    .first()
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};
// Find product helper function
const addProductToFestival = async (festival_id, product_id) => {
  try {
    await db.transaction(async (trx) => {

      const db_product = await trx("products")
        .where({ product_id })
        .update({
          product_festivals_id: trx.raw(
            "array_append(product_festivals_id, ?)",
            [festival_id]
          )
        })
        .returning("*");
  
      if (!db_product) {
        return {
          success: false,
          details: "Inserting new product guest failed.",
        };
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }
};

// Claim product helper function
const claimProduct = async (db_user, product_id) => {
  try {
    await db.transaction(async (trx) => {
      const db_product = await trx("products")
        .where({ product_id })
        .update({
          product_user_guest_id: trx.raw(
            "array_append(product_user_guest_id, ?)",
            [db_user.tasttlig_user_id]
          ),
        })
        .returning("*");

      if (!db_product) {
        return {
          success: false,
          details: "Inserting new product guest failed.",
        };
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

module.exports = {
  createNewProduct,
  getProductsInFestival,
  getProductsFromUser,
  findProduct,
  addProductToFestival,
  claimProduct,
};
