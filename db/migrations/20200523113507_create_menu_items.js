"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("menu_items", table => {
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
    table.string("menu_item_img_url").notNullable();
    table.string("name").notNullable();
    table.integer("price").notNullable();
    table.integer("quantity").notNullable();
    table.boolean("vegetarian").defaultTo(false);
    table.boolean("vegan").defaultTo(false);
    table.boolean("gluten_free").defaultTo(false);
    table.boolean("halal").defaultTo(false);
    table.string("spice_level");
    table.text("description").notNullable();
    table.boolean("tray").defaultTo(false);
    table.boolean("napkin").defaultTo(false);
    table.boolean("table").defaultTo(false);
    table.boolean("table_cloth").defaultTo(false);
    table.boolean("decoration").defaultTo(false);
    table.boolean("vending").defaultTo(false);
    table.boolean("clean_up").defaultTo(false);
    table.boolean("event_planning").defaultTo(false);
    table.boolean("event_design").defaultTo(false);
    table.boolean("event_production").defaultTo(false);
    table.integer("discount");
    table.string("menu_item_code").notNullable();
    table.boolean("feedback_public_global").defaultTo(true);
    table.boolean("feedback_public_local").defaultTo(true);
    table.string("profile_img_url");
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("email").notNullable();
    table.string("phone_number").notNullable();
    table.string("food_handler_certificate");
    table.date("date_of_issue");
    table.date("expiry_date");
    table.boolean("verified").notNullable();
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
  return knex.schema.dropTable("menu_items");
};
