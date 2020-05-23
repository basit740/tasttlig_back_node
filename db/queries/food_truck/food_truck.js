"use strict";

// Food truck table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export food truck table
module.exports = {
  getAllFoodTruck: async () => {
    try {
      const returning = await db("food_trucks");
      return { success: true, foodTrucks: returning };
    } catch (err) {
      return { success: false, message: "No food truck found." };
    }
  },
  createFoodTruck: async (foodTruck, user_id) => {
    const first_name = foodTruck.first_name;
    const last_name = foodTruck.last_name;
    const email = foodTruck.email;
    const phone_number = foodTruck.phone_number;
    const profile_type = foodTruck.profile_type;
    const food_business_license = foodTruck.food_business_license;
    const food_business_license_date_of_issue =
      foodTruck.food_business_license_date_of_issue;
    const food_business_license_expiry_date =
      foodTruck.food_business_license_expiry_date;
    const food_handler_certificate = foodTruck.food_handler_certificate;
    const food_handler_certificate_date_of_issue =
      foodTruck.food_handler_certificate_date_of_issue;
    const food_handler_certificate_expiry_date =
      foodTruck.food_handler_certificate_expiry_date;
    const food_business_insurance = foodTruck.food_business_insurance;
    const food_business_insurance_date_of_issue =
      foodTruck.food_business_insurance_date_of_issue;
    const food_business_insurance_expiry_date =
      foodTruck.food_business_insurance_expiry_date;
    try {
      const returning = await db("food_trucks")
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
