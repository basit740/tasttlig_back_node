"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("users", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("phone").notNullable();
    table
      .string("email")
      .unique()
      .notNullable();
    table.string("password_digest").notNullable();
    table.string("img_url");
    table.boolean("chef").defaultTo(false);
    table.boolean("caterer").defaultTo(false);
    table.string("business_address");
    table.string("facebook");
    table.string("twitter");
    table.string("instagram");
    table.string("youtube");
    table.string("linkedin");
    table.string("website");
    table.text("bio");
    table.string("food_handler_certificate");
    table.date("date_of_issue");
    table.date("expiry_date");
    table.boolean("commercial_kitchen").defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("users");
};
