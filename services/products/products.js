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

module.exports = {
  createNewProduct,
};
