"use strict";

// Chef table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export chef table
module.exports = {
  getAllChef: async () => {
    try {
      const returning = await db("chefs");
      return { success: true, chefs: returning };
    } catch (err) {
      return { success: false, message: "No chef found." };
    }
  },
  createChef: async (chef, user_id) => {
    const first_name = chef.first_name;
    const last_name = chef.last_name;
    const email = chef.email;
    const phone_number = chef.phone_number;
    const profile_type = chef.profile_type;
    const food_business_license = chef.food_business_license;
    const food_business_license_date_of_issue =
      chef.food_business_license_date_of_issue;
    const food_business_license_expiry_date =
      chef.food_business_license_expiry_date;
    const food_handler_certificate = chef.food_handler_certificate;
    const food_handler_certificate_date_of_issue =
      chef.food_handler_certificate_date_of_issue;
    const food_handler_certificate_expiry_date =
      chef.food_handler_certificate_expiry_date;
    const food_business_insurance = chef.food_business_insurance;
    const food_business_insurance_date_of_issue =
      chef.food_business_insurance_date_of_issue;
    const food_business_insurance_expiry_date =
      chef.food_business_insurance_expiry_date;
    try {
      const returning = await db("chefs")
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
