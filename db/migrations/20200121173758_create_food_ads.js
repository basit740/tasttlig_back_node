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
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("food_ads");
};
