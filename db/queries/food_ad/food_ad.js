"use strict";

// Food Ad table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export food ads table
module.exports = {
  getAllFoodAd: async () => {
    try {
      const returning = await db("food_ads").where("quantity", ">", 0);
      return { success: true, foodAds: returning };
    } catch (err) {
      return { success: false, message: "No food ad found." };
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
  createFoodAd: async (foodAd, user_id) => {
    const food_ad_img_url = foodAd.food_ad_img_url;
    const name = foodAd.name;
    const ethnicity = foodAd.ethnicity;
    const price = foodAd.price;
    const quantity = foodAd.quantity;
    const food_ad_street_address = foodAd.food_ad_street_address;
    const food_ad_city = foodAd.food_ad_city;
    const food_ad_province_territory = foodAd.food_ad_province_territory;
    const food_ad_postal_code = foodAd.food_ad_postal_code;
    const date = foodAd.date;
    const start_time = foodAd.start_time;
    const end_time = foodAd.end_time;
    const vegetarian = foodAd.vegetarian;
    const vegan = foodAd.vegan;
    const gluten_free = foodAd.gluten_free;
    const halal = foodAd.halal;
    const description = foodAd.description;
    const food_ad_code = foodAd.food_ad_code;
    const profile_img_url = foodAd.profile_img_url;
    const first_name = foodAd.first_name;
    const last_name = foodAd.last_name;
    const email = foodAd.email;
    const phone_number = foodAd.phone_number;
    const food_handler_certificate = foodAd.food_handler_certificate;
    const date_of_issue = foodAd.date_of_issue;
    const expiry_date = foodAd.expiry_date;
    const verified = foodAd.verified;
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
          ethnicity,
          price,
          quantity,
          food_ad_street_address,
          food_ad_city,
          food_ad_province_territory,
          food_ad_postal_code,
          date,
          start_time,
          end_time,
          vegetarian,
          vegan,
          gluten_free,
          halal,
          description,
          food_ad_code,
          profile_img_url,
          first_name,
          last_name,
          email,
          phone_number,
          food_handler_certificate,
          date_of_issue,
          expiry_date,
          verified,
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
  updateFoodAdQuantity: async (foodAd, id) => {
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
  updateFoodAdFeedbackPublicGlobal: async (foodAd, user_id) => {
    const feedback_public_global = foodAd.feedback_public_global;
    const feedback_public_local = foodAd.feedback_public_local;
    try {
      const returning = await db("food_ads")
        .where("user_id", user_id)
        .update({ feedback_public_global, feedback_public_local })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  updateFoodAdFeedbackPublicLocal: async (foodAd, id) => {
    const feedback_public_local = foodAd.feedback_public_local;
    try {
      const returning = await db("food_ads")
        .where("id", id)
        .update({ feedback_public_local })
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
