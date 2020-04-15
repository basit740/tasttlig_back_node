"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("food_ads", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table
      .bigInteger("user_id")
      .unsigned()
      .index()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("food_ad_img_url").notNullable();
    table.string("name").notNullable();
    table.string("incentive").notNullable();
    table.integer("price");
    table.integer("quantity").notNullable();
    table.string("food_ad_street_address").notNullable();
    table.string("food_ad_city").notNullable();
    table.string("food_ad_province_territory").notNullable();
    table.string("food_ad_postal_code").notNullable();
    table.string("spice_level");
    table.boolean("vegetarian").defaultTo(false);
    table.boolean("vegan").defaultTo(false);
    table.boolean("gluten_free").defaultTo(false);
    table.boolean("halal").defaultTo(false);
    table.integer("ready_time");
    table.string("ready_time_type");
    table.integer("expiry_time");
    table.string("expiry_time_type");
    table.text("description").notNullable();
    table.string("food_ad_code").notNullable();
    table.boolean("food_ad_active");
    table.string("profile_img_url");
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("email").notNullable();
    table.string("phone_number").notNullable();
    table.string("food_handler_certificate").notNullable();
    table.date("date_of_issue").notNullable();
    table.date("expiry_date").notNullable();
    table.boolean("commercial_kitchen").notNullable();
    table.boolean("chef");
    table.boolean("caterer");
    table.string("business_street_address");
    table.string("business_city");
    table.string("business_province_territory");
    table.string("business_postal_code");
    table.string("facebook");
    table.string("twitter");
    table.string("instagram");
    table.string("youtube");
    table.string("linkedin");
    table.string("website");
    table.text("bio");
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("food_ads");
};