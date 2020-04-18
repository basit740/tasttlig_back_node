"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("users", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table
      .string("email")
      .unique()
      .notNullable();
    table.string("password_digest").notNullable();
    table.string("phone_number").notNullable();
    table.string("food_handler_certificate");
    table.string("date_of_issue");
    table.string("expiry_date");
    table.boolean("verified").defaultTo(false);
    table.boolean("certified");
    table.string("reject_note");
    table.string("profile_img_url");
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
  return knex.schema.dropTable("users");
};
