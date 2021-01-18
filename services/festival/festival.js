"use strict";

// Libraries
const { db } = require("../../db/db-config");

const getAllFestivals = async () => {
  let query = db.
  select("*")
  .from("festivals");
  return await query
  .then((value) => {
    return { success: true, details: value };
  })
}

const createNewFestival = async(details) => {
  console.log("hello");
  try {
    await db.transaction(async (trx) => {
      /* if (
        createdByAdmin ||
        user_role_object.includes("RESTAURANT") ||
        user_role_object.includes("RESTAURANT_PENDING")
      ) {
        food_sample_details.status = "ACTIVE";
      } */
      const festival_details = {
        festival_start_time: details.festival_start_time,
        festival_end_time: details.festival_end_time,
        festival_name: details.festival_name,
        festival_type: details.festival_type,
        festival_price: details.festival_price,
        festival_city: details_festival_city,
        festival_start_date: details.festival_start_date,
        festival_end_date: details.festival_end_date,
      }
      console.log(db_festival);
      console.log(festival_details);
      const db_festival = await trx("festival")
      .insert(festival_details)
      .returning("*")
    })
    const images = details.festival_images.map((festival_image) => ({
      festival_id: db_festival[0].festival_id,
      image_url: festival_image,
      description: details.festival_image_description
    }));

    await trx("festival_images").insert(images);

   } catch(error) {
      return { success: false, details: error.message };
    }
  }

module.exports = {
  getAllFestivals,
  createNewFestival
};