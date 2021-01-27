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
const createNewProduct = async (
  db_user,
  product_information,
  product_images,
  createdByAdmin
) => {
  try {
    await db.transaction(async (trx) => {
      let user_role_object = db_user.role;
      console.log(product_information);
      if (user_role_object.includes("HOST")) {
        product_information.status = "ACTIVE";
      }
      const db_product = await trx("products")
        .insert(product_information)
        .returning("*");
      if (!db_product) {
        return { success: false, details: "Inserting new experience failed." };
      }
      console.log(product_images);
      const images = product_images.map((product_image) => ({
        product_id: db_product[0].product_id,
        product_image_url: product_image,
      }));

      await trx("product_images").insert(images);
      console.log("hello");
      if (createdByAdmin) {
        // Email to review the food sample from the owner
        jwt.sign(
          {
            id: db_product[0].product_id,
            user_id: db_product[0].product_business_id,
          },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "3d",
          },
          async (err, emailToken) => {
            try {
              const url = `${SITE_BASE}/review-food-sample/${db_product[0].product_id}/${emailToken}`;

              await Mailer.sendMail({
                from: process.env.SES_DEFAULT_FROM,
                to: db_user.email,
                subject: `[Tasttlig] Review Product "${product_information.product_name}"`,
                template: "review_food_sample",
                context: {
                  title: product_information.product_name,
                  url_review_product: url,
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
          subject: `[Tasttlig] New Product Created`,
          template: "new_food_sample",
          context: {
            title: product_information.product_name,
            status: product_information.product_status,
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
  createNewProduct,
};
