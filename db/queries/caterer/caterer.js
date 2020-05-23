"use strict";

// Caterer table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export caterer table
module.exports = {
  getAllCaterer: async () => {
    try {
      const returning = await db("caterers");
      return { success: true, caterers: returning };
    } catch (err) {
      return { success: false, message: "No caterer found." };
    }
  },
  createCaterer: async (caterer, user_id) => {
    const first_name = caterer.first_name;
    const last_name = caterer.last_name;
    const email = caterer.email;
    const phone_number = caterer.phone_number;
    const profile_type = caterer.profile_type;
    const food_business_license = caterer.food_business_license;
    const food_business_license_date_of_issue =
      caterer.food_business_license_date_of_issue;
    const food_business_license_expiry_date =
      caterer.food_business_license_expiry_date;
    const food_handler_certificate = caterer.food_handler_certificate;
    const food_handler_certificate_date_of_issue =
      caterer.food_handler_certificate_date_of_issue;
    const food_handler_certificate_expiry_date =
      caterer.food_handler_certificate_expiry_date;
    const food_business_insurance = caterer.food_business_insurance;
    const food_business_insurance_date_of_issue =
      caterer.food_business_insurance_date_of_issue;
    const food_business_insurance_expiry_date =
      caterer.food_business_insurance_expiry_date;
    try {
      const returning = await db("caterers")
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
