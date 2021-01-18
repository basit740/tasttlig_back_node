"use strict";

// Libraries
const { db } = require("../../db/db-config");

const getAllFestivals = async () => {
  let query = db.select("*").from("festivals");
  return await query.then((value) => {
    return { success: true, details: value };
  });
};

/* Save new festival to festivals and festival images tables helper 
function */
const createNewFestival = async (
  festival_details,
  festival_images,
  festival_image_description
) => {
  try {
    await db.transaction(async (trx) => {
      const db_festival = await trx("festivals")
        .insert(festival_details)
        .returning("*");

      if (!db_festival) {
        return { success: false, details: "Inserting new festival failed." };
      }

      const images = festival_images.map((festival_image_url) => ({
        festival_id: db_festival[0].festival_id,
        festival_image_url,
        festival_image_description,
      }));

      await trx("festival_images").insert(images);
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

module.exports = {
  getAllFestivals,
  createNewFestival,
};
