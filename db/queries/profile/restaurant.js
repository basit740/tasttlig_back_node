"use strict";

const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

module.exports = {
  createPurchase: async (restaurant, user_id) => {
    const email = restaurant.email;
    const postal_code = restaurant.postal_code;
    const address_line_1 = restaurant.address_line_1;
    const address_line_2 = restaurant.address_line_2;
    const city = restaurant.city;
    const province = restaurant.province;
    const description = restaurant.description;
    const phone_number = restaurant.phone_number;
    const img_url = restaurant.img_url;
    const isValidated = restaurant.isValidated;
    try {
      const returning = await db("restaurants")
        .insert({
          user_id,
          email,
          postal_code,
          address_line_1,
          address_line_2,
          city,
          province,
          description,
          phone_number,
          img_url,
          isValidated
        })
        .returning("*");
      if (returning)
        return (response = { success: true, restaurant: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  }
};
