"use strict";

// Technology service table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export technology service table
module.exports = {
  getAllTechnologyService: async () => {
    try {
      const returning = await db("technology_services");
      return { success: true, technologyServices: returning };
    } catch (err) {
      return { success: false, message: "No technology service found." };
    }
  },
  getUserTechnologyService: async user_id => {
    try {
      const returning = await db("technology_services").where(
        "user_id",
        user_id
      );
      return { success: true, technologyServices: returning };
    } catch (err) {
      return { success: false, message: "No technology service found." };
    }
  },
  createTechnologyService: async (technologyService, user_id) => {
    const profile_img_url = technologyService.profile_img_url;
    const first_name = technologyService.first_name;
    const last_name = technologyService.last_name;
    const email = technologyService.email;
    const phone_number = technologyService.phone_number;
    const description = technologyService.description;
    try {
      const returning = await db("technology_services")
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
