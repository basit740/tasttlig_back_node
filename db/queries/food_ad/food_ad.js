"use strict";

// Food Ad table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export food ads table
module.exports = {
  createFoodAd: async (foodAd, user_id) => {
    const food_ad_img_url = foodAd.food_ad_img_url;
    const name = foodAd.name;
    const incentive = foodAd.incentive;
    const price = foodAd.price;
    const quantity = foodAd.quantity;
    const food_ad_street_address = foodAd.food_ad_street_address;
    const food_ad_city = foodAd.food_ad_city;
    const food_ad_province_territory = foodAd.food_ad_province_territory;
    const food_ad_postal_code = foodAd.food_ad_postal_code;
    const spice_level = foodAd.spice_level;
    const vegetarian = foodAd.vegetarian;
    const vegan = foodAd.vegan;
    const gluten_free = foodAd.gluten_free;
    const halal = foodAd.halal;
    const ready_time = foodAd.ready_time;
    const ready_time_type = foodAd.ready_time_type;
    const expiry_time = foodAd.expiry_time;
    const expiry_time_type = foodAd.expiry_time_type;
    const description = foodAd.description;
    const food_ad_code = foodAd.food_ad_code;
    const food_ad_active = foodAd.food_ad_active;
    const profile_img_url = foodAd.profile_img_url;
    const first_name = foodAd.first_name;
    const last_name = foodAd.last_name;
    const email = foodAd.email;
    const phone_number = foodAd.phone_number;
    const food_handler_certificate = foodAd.food_handler_certificate;
    const date_of_issue = foodAd.date_of_issue;
    const expiry_date = foodAd.expiry_date;
    const commercial_kitchen = foodAd.commercial_kitchen;
    const chef = foodAd.chef;
    const caterer = foodAd.caterer;
    const business_street_address = foodAd.business_street_address;
    const business_city = foodAd.business_city;
    const business_province_territory = foodAd.business_province_territory;
    const business_postal_code = foodAd.business_postal_code;
    const facebook = foodAd.facebook;
    const twitter = foodAd.twitter;
    const instagram = foodAd.instagram;
    const youtube = foodAd.youtube;
    const linkedin = foodAd.linkedin;
    const website = foodAd.website;
    const bio = foodAd.bio;
    try {
      const returning = await db("food_ads")
        .insert({
          user_id,
          food_ad_img_url,
          name,
          incentive,
          price,
          quantity,
          food_ad_street_address,
          food_ad_city,
          food_ad_province_territory,
          food_ad_postal_code,
          spice_level,
          vegetarian,
          vegan,
          gluten_free,
          halal,
          ready_time,
          ready_time_type,
          expiry_time,
          expiry_time_type,
          description,
          food_ad_code,
          food_ad_active,
          profile_img_url,
          first_name,
          last_name,
          email,
          phone_number,
          food_handler_certificate,
          date_of_issue,
          expiry_date,
          commercial_kitchen,
          chef,
          caterer,
          business_street_address,
          business_city,
          business_province_territory,
          business_postal_code,
          facebook,
          twitter,
          instagram,
          youtube,
          linkedin,
          website,
          bio
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getUserFoodAd: async user_id => {
    try {
      const returning = await db("food_ads").where("user_id", user_id);
      return { success: true, foodAds: returning };
    } catch (err) {
      return { success: false, message: "No food ad found." };
    }
  },
  getAllFoodAd: async () => {
    try {
      const returning = await db("food_ads");
      return { success: true, foodAds: returning };
    } catch (err) {
      return { success: false, message: "No food ad found." };
    }
  },
  updateFoodAd: async (foodAd, id) => {
    const quantity = foodAd.quantity;
    try {
      const returning = await db("food_ads")
        .where("id", id)
        .update({ quantity })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  deleteFoodAd: async id => {
    try {
      const returning = await db("food_ads")
        .where("id", id)
        .del();
      if (returning) {
        return {
          success: true,
          message: "Food ad has been deleted."
        };
      }
    } catch (err) {
      return { success: false, data: err };
    }
  }
};