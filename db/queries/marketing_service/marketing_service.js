"use strict";

// Marketing service table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export marketing service table
module.exports = {
  getAllMarketingService: async () => {
    try {
      const returning = await db("marketing_services");
      return { success: true, marketingServices: returning };
    } catch (err) {
      return { success: false, message: "No marketing service found." };
    }
  },
  getUserMarketingService: async user_id => {
    try {
      const returning = await db("marketing_services").where(
        "user_id",
        user_id
      );
      return { success: true, marketingServices: returning };
    } catch (err) {
      return { success: false, message: "No marketing service found." };
    }
  },
  createMarketingService: async (marketingService, user_id) => {
    const profile_img_url = marketingService.profile_img_url;
    const first_name = marketingService.first_name;
    const last_name = marketingService.last_name;
    const email = marketingService.email;
    const phone_number = marketingService.phone_number;
    const description = marketingService.description;
    try {
      const returning = await db("marketing_services")
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
