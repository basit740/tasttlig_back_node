"use strict";

// Libraries
const { db } = require("../../db/db-config");
const { generateRandomString } = require("../../functions/functions");

const postBusinessPassportDetails = async (data) => {
  try {
    return await db.transaction(async (trx) => {
      const business_details = {
        business_details_user_id: data["user_id"],
        business_name: data["user_business_name"],
        business_street_number: data["user_business_street_number"],
        business_street_name: data["user_business_street_name"],
        business_unit: data["user_business_unit"],
        country: data["user_business_country"],
        city: data["user_business_city"],
        state: data["user_business_province"],
        zip_postal_code: data["user_business_postal_code"],
        business_registered: data["user_business_registered"],
        retail_business: data["user_business_retail"],
        business_registered_location: data["user_business_registered_location"],
        business_type: data["user_business_type"],
        food_business_type: data["user_business_food_type"],
        business_passport_id: generateRandomString("6"),
        business_details_created_at_datetime: data["start_date"],
      };

      var business_details_id = await trx("business_details")
        .insert(business_details)
        .returning("business_details_id");

        console.log("detail id",business_details_id[0]);

      const business_details_images = {
        business_details_logo: data["user_business_logo"],
        food_handling_certificate: data["user_business_food_handling"],
        business_details_id: business_details_id[0],
      };

      await trx("business_details_images")
        .insert(business_details_images);

        return { success: true };
    });
  } catch (error) {
    return { success: false, details: error.message };
  }
};

module.exports = {
  postBusinessPassportDetails,
};
