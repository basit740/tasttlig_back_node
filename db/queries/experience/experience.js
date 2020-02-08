"use strict";

const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

module.exports = {
  createExperience: async (experience, user_id) => {
    const title = experience.title;
    const img_url_1 = experience.img_url_1;
    const img_url_2 = experience.img_url_2;
    const img_url_3 = experience.img_url_3;
    const food_ethnicity = experience.food_ethnicity;
    const capacity = experience.capacity;
    const experience_type = experience.experience_type;
    const dress_code = experience.dress_code;
    const entertainment = experience.entertainment;
    const price = experience.price;
    const start_time = experience.start_time;
    const end_time = experience.end_time;
    const date = experience.date;
    const postal_code = experience.postal_code;
    const address_line_1 = experience.address_line_1;
    const address_line_2 = experience.address_line_2;
    const city = experience.city;
    const province = experience.province;
    const experience_information = experience.experience_information;
    try {
      const returning = await db("experiences")
        .insert({
          user_id,
          title,
          food_ethnicity,
          img_url_1,
          img_url_2,
          img_url_3,
          price,
          experience_type,
          dress_code,
          entertainment,
          capacity,
          start_time,
          end_time,
          postal_code,
          address_line_1,
          address_line_2,
          date,
          city,
          province,
          experience_information
        })
        .returning("*");

      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getUserExperiences: async user_id => {
    try {
      const returning = await db("experiences").where("user_id", user_id);
      return (response = { success: true, experiences: returning });
    } catch (err) {
      return (response = { success: false, message: "No experience found" });
    }
  },
  getAllExperiences: async () => {
    try {
      const returning = await db("experiences");
      return (response = { success: true, experiences: returning });
    } catch (err) {
      return (response = { success: false, message: "No experience found" });
    }
  }
};
