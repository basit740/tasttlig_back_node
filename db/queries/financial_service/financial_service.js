"use strict";

// Financial service table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export financial service table
module.exports = {
  getAllFinancialService: async () => {
    try {
      const returning = await db("financial_services");
      return { success: true, financialServices: returning };
    } catch (err) {
      return { success: false, message: "No financial service found." };
    }
  },
  getUserFinancialService: async user_id => {
    try {
      const returning = await db("financial_services").where(
        "user_id",
        user_id
      );
      return { success: true, financialServices: returning };
    } catch (err) {
      return { success: false, message: "No financial service found." };
    }
  },
  createFinancialService: async (financialService, user_id) => {
    const profile_img_url = financialService.profile_img_url;
    const first_name = financialService.first_name;
    const last_name = financialService.last_name;
    const email = financialService.email;
    const phone_number = financialService.phone_number;
    const description = financialService.description;
    try {
      const returning = await db("financial_services")
        .insert({
          user_id,
          profile_img_url,
          first_name,
          last_name,
          email,
          phone_number,
          description
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  }
};
