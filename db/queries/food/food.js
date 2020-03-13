"use strict";

// Food table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export foods table
module.exports = {
  createFood: async (food, user_id) => {
    const food_img_url = food.food_img_url;
    const name = food.name;
    const food_ethnicity = food.food_ethnicity;
    const price = food.price;
    const quantity = food.quantity;
    const food_street_address = food.food_street_address;
    const food_city = food.food_city;
    const food_province_territory = food.food_province_territory;
    const food_postal_code = food.food_postal_code;
    const spice_level = food.spice_level;
    const vegetarian = food.vegetarian;
    const vegan = food.vegan;
    const gluten_free = food.gluten_free;
    const halal = food.halal;
    const ready_time = food.ready_time;
    const time_type = food.time_type;
    const description = food.description;
    try {
      const returning = await db("foods")
        .insert({
          user_id,
          food_img_url,
          name,
          food_ethnicity,
          price,
          quantity,
          food_street_address,
          food_city,
          food_province_territory,
          food_postal_code,
          spice_level,
          vegetarian,
          vegan,
          gluten_free,
          halal,
          ready_time,
          time_type,
          description
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getUserFood: async user_id => {
    try {
      const returning = await db("foods").where("user_id", user_id);
      return { success: true, foods: returning };
    } catch (err) {
      return { success: false, message: "No food found." };
    }
  },
  getAllFood: async () => {
    try {
      const returning = await db("foods").innerJoin("users", "foods.user_id", "users.id");
      return { success: true, foods: returning };
    } catch (err) {
      return { success: false, message: "No food found." };
    }
  }
};
