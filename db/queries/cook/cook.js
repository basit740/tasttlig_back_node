"use strict";

// Cook table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export cook table
module.exports = {
  getAllCook: async () => {
    try {
      const returning = await db("cooks");
      return { success: true, cooks: returning };
    } catch (err) {
      return { success: false, message: "No cook found." };
    }
  },
  createCook: async (cook, user_id) => {
    const first_name = cook.first_name;
    const last_name = cook.last_name;
    const email = cook.email;
    const phone_number = cook.phone_number;
    const profile_type = cook.profile_type;
    const food_business_license = cook.food_business_license;
    const food_business_license_date_of_issue =
      cook.food_business_license_date_of_issue;
    const food_business_license_expiry_date =
      cook.food_business_license_expiry_date;
    const food_handler_certificate = cook.food_handler_certificate;
    const food_handler_certificate_date_of_issue =
      cook.food_handler_certificate_date_of_issue;
    const food_handler_certificate_expiry_date =
      cook.food_handler_certificate_expiry_date;
    const food_business_insurance = cook.food_business_insurance;
    const food_business_insurance_date_of_issue =
      cook.food_business_insurance_date_of_issue;
    const food_business_insurance_expiry_date =
      cook.food_business_insurance_expiry_date;
    try {
      const returning = await db("cooks")
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
