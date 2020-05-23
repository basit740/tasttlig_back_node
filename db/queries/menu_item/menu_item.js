"use strict";

// Menu item table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export menu item table
module.exports = {
  getAllMenuItem: async () => {
    try {
      const returning = await db("menu_items");
      return { success: true, menuItems: returning };
    } catch (err) {
      return { success: false, message: "No menu item found." };
    }
  },
  createMenuItem: async (menuItem, user_id) => {
    const first_name = menuItem.first_name;
    const last_name = menuItem.last_name;
    const email = menuItem.email;
    const phone_number = menuItem.phone_number;
    const profile_type = menuItem.profile_type;
    const food_business_license = menuItem.food_business_license;
    const food_business_license_date_of_issue =
      menuItem.food_business_license_date_of_issue;
    const food_business_license_expiry_date =
      menuItem.food_business_license_expiry_date;
    const food_handler_certificate = menuItem.food_handler_certificate;
    const food_handler_certificate_date_of_issue =
      menuItem.food_handler_certificate_date_of_issue;
    const food_handler_certificate_expiry_date =
      menuItem.food_handler_certificate_expiry_date;
    const food_business_insurance = menuItem.food_business_insurance;
    const food_business_insurance_date_of_issue =
      menuItem.food_business_insurance_date_of_issue;
    const food_business_insurance_expiry_date =
      menuItem.food_business_insurance_expiry_date;
    try {
      const returning = await db("menu_items")
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
