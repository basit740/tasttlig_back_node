"use strict";

// Food table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export foods table
module.exports = {
  createFood: async (food, user_id) => {
    const img_url_1 = food.img_url_1;
    const name = food.name;
    const food_ethnicity = food.food_ethnicity;
    const price = food.price;
    const quantity = food.quantity;
    const street_address = food.street_address;
    const city = food.city;
    const province_territory = food.province_territory;
    const postal_code = food.postal_code;
    const spice_level = food.spice_level;
    const vegetarian = food.vegetarian;
    const vegan = food.vegan;
    const gluten_free = food.gluten_free;
    const halal = food.halal;
    const ready_time = food.ready_time;
    const time_type = food.time_type;
    const delivery_fee = food.delivery_fee;
    const description = food.description;
    try {
      const returning = await db("foods")
        .insert({
          user_id,
          img_url_1,
          name,
          food_ethnicity,
          price,
          quantity,
          street_address,
          city,
          province_territory,
          postal_code,
          spice_level,
          vegetarian,
          vegan,
          gluten_free,
          halal,
          ready_time,
          time_type,
          delivery_fee,
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
