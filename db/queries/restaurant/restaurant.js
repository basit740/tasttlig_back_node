"use strict";

// Restaurant table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export restaurant table
module.exports = {
  getAllRestaurant: async () => {
    try {
      const returning = await db("restaurants");
      return { success: true, restaurants: returning };
    } catch (err) {
      return { success: false, message: "No restaurant found." };
    }
  },
  createRestaurant: async (restaurant, user_id) => {
    const first_name = restaurant.first_name;
    const last_name = restaurant.last_name;
    const email = restaurant.email;
    const phone_number = restaurant.phone_number;
    const profile_type = restaurant.profile_type;
    const food_business_license = restaurant.food_business_license;
    const food_business_license_date_of_issue =
      restaurant.food_business_license_date_of_issue;
    const food_business_license_expiry_date =
      restaurant.food_business_license_expiry_date;
    const food_handler_certificate = restaurant.food_handler_certificate;
    const food_handler_certificate_date_of_issue =
      restaurant.food_handler_certificate_date_of_issue;
    const food_handler_certificate_expiry_date =
      restaurant.food_handler_certificate_expiry_date;
    const food_business_insurance = restaurant.food_business_insurance;
    const food_business_insurance_date_of_issue =
      restaurant.food_business_insurance_date_of_issue;
    const food_business_insurance_expiry_date =
      restaurant.food_business_insurance_expiry_date;
    try {
      const returning = await db("restaurants")
        .insert({
          user_id,
          first_name,
          last_name,
          email,
          phone_number,
          profile_type,
          food_business_license,
          food_business_license_date_of_issue,
          food_business_license_expiry_date,
          food_handler_certificate,
          food_handler_certificate_date_of_issue,
          food_handler_certificate_expiry_date,
          food_business_insurance,
          food_business_insurance_date_of_issue,
          food_business_insurance_expiry_date
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  }
};
