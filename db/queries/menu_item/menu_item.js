"use strict";

// Menu item table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export menu item table
module.exports = {
  getAllMenuItem: async () => {
    try {
      const returning = await db("menu_items").where("quantity", ">", 0);
      return { success: true, menuItems: returning };
    } catch (err) {
      return { success: false, message: "No menu item found." };
    }
  },
  getUserMenuItem: async user_id => {
    try {
      const returning = await db("menu_items").where("user_id", user_id);
      return { success: true, menuItems: returning };
    } catch (err) {
      return { success: false, message: "No menu item found." };
    }
  },
  createMenuItem: async (menuItem, user_id) => {
    const menu_item_img_url = menuItem.menu_item_img_url;
    const name = menuItem.name;
    const price = menuItem.price;
    const quantity = menuItem.quantity;
    const vegetarian = menuItem.vegetarian;
    const vegan = menuItem.vegan;
    const gluten_free = menuItem.gluten_free;
    const halal = menuItem.halal;
    const spice_level = menuItem.spice_level;
    const description = menuItem.description;
    const tray = menuItem.tray;
    const napkin = menuItem.napkin;
    const table = menuItem.table;
    const table_cloth = menuItem.table_cloth;
    const decoration = menuItem.decoration;
    const vending = menuItem.vending;
    const clean_up = menuItem.clean_up;
    const event_planning = menuItem.event_planning;
    const event_design = menuItem.event_design;
    const event_production = menuItem.event_production;
    const discount = menuItem.discount;
    const menu_item_code = menuItem.menu_item_code;
    const profile_img_url = menuItem.profile_img_url;
    const first_name = menuItem.first_name;
    const last_name = menuItem.last_name;
    const email = menuItem.email;
    const phone_number = menuItem.phone_number;
    const food_handler_certificate = menuItem.food_handler_certificate;
    const date_of_issue = menuItem.date_of_issue;
    const expiry_date = menuItem.expiry_date;
    const verified = menuItem.verified;
    const business_street_address = menuItem.business_street_address;
    const business_city = menuItem.business_city;
    const business_province_territory = menuItem.business_province_territory;
    const business_postal_code = menuItem.business_postal_code;
    const facebook = menuItem.facebook;
    const twitter = menuItem.twitter;
    const instagram = menuItem.instagram;
    const youtube = menuItem.youtube;
    const linkedin = menuItem.linkedin;
    const website = menuItem.website;
    const bio = menuItem.bio;
    try {
      const returning = await db("menu_items")
        .insert({
          user_id,
          menu_item_img_url,
          name,
          price,
          quantity,
          vegetarian,
          vegan,
          gluten_free,
          halal,
          spice_level,
          description,
          tray,
          napkin,
          table,
          table_cloth,
          decoration,
          vending,
          clean_up,
          event_planning,
          event_design,
          event_production,
          discount,
          menu_item_code,
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
  updateMenuItemQuantity: async (menuItem, id) => {
    const quantity = menuItem.quantity;
    try {
      const returning = await db("menu_items")
        .where("id", id)
        .update({ quantity })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  updateMenuItemFeedbackPublicGlobal: async (menuItem, user_id) => {
    const feedback_public_global = menuItem.feedback_public_global;
    const feedback_public_local = menuItem.feedback_public_local;
    try {
      const returning = await db("menu_items")
        .where("user_id", user_id)
        .update({ feedback_public_global, feedback_public_local })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  updateMenuItemFeedbackPublicLocal: async (menuItem, id) => {
    const feedback_public_local = menuItem.feedback_public_local;
    try {
      const returning = await db("menu_items")
        .where("id", id)
        .update({ feedback_public_local })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  deleteMenuItem: async id => {
    try {
      const returning = await db("menu_items")
        .where("id", id)
        .del();
      if (returning) {
        return {
          success: true,
          message: "Menu item has been deleted."
        };
      }
    } catch (err) {
      return { success: false, data: err };
    }
  }
};
