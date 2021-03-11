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
const getProductsInFestival = async (festival_id, filters, keyword) => {
  let query = db
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
    .join(
      "festivals",
      "products.product_festivals_id[1]",
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
    .having("products.product_festivals_id", "@>", [festival_id])
  /*     .then((value) => {
        console.log(value)
        return { success: true, details: value };
      })
      .catch((reason) => {
        console.log(reason)
        return { success: false, details: reason };
      }); */
  let orderByArray = []
  if (filters.price) {


    if (filters.price === "lowest_to_highest") {
      //console.log("lowest to highest")
      orderByArray.push({ column: "products.product_price", order: "asc" })
      //query.orderBy("products.product_price", "asc")
    } else if (filters.price === "highest_to_lowest") {
      //console.log("highest to lowest");
      orderByArray.push({ column: "products.product_price", order: "desc" })
      //query.orderBy("products.product_price", "desc")
    }
  }
  if (filters.quantity) {
    if (filters.quantity === "lowest_to_highest") {
      orderByArray.push({ column: "products.product_quantity", order: "asc" })
    } else if (filters.quantity === "highest_to_lowest") {
      orderByArray.push({ column: "products.product_quantity", order: "desc" })
    }
  }

  if (filters.price || filters.quantity) {
    query.orderBy(orderByArray);
  }
  if (filters.size) {
    if (filters.size === "bite_size") {
      query.having("products.product_size", "=", "Bite Size");
    } else if (filters.size === "quarter") {
      query.having("products.product_size", "=", "Quarter");
    } else if (filters.size === "half") {
      query.having("products.product_size", "=", "Half");
    } else if (filters.size === "full") {
      query.having("products.product_size", "=", "Full");
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
                "main.product_name, " +
                "main.product_size, " +
                "main.product_price, " +
                //"main.business_city, " +
                "main.product_description)) as search_text"
            )
          )
          .from(query.as("main"))
          .as("main")
      )
      .orderBy("rank", "desc");
  }

  return await query
    .then((value) => {
      //console.log(value)
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log(reason)
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
      "nationalities.nationality",
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
    .leftJoin(
      "nationalities",
      "products.product_made_in_nationality_id",
      "nationalities.id"
      )
    .groupBy("products.product_id")
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
      console.log(value);
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log(reason);
      return { success: false, details: reason };
    });
};

const deleteProductsFromUser = async(user_id, delete_items) => {
  try {
    for (let item of delete_items) {
      await db.transaction(async(trx) => {
        const productImagesDelete = await trx("product_images")
         .where({
           product_id: item.product_id
         })
         .del()
        const productDelete = await trx("products")
        .where({
          product_id: item.product_id,
        })
        .del()
        .then(() => {
          return { success: true };
        })
        .catch((reason) => {
          console.log(reason);
          return { success: false, details: reason };
        });
      })
    }
  } catch(error) {
    return { success: false, details: error}
  }
}

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
  deleteProductsFromUser,
  addProductToFestival,
  claimProduct,
};
