"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("caterers", table => {
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
    table.string("profile_img_url");
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("email").notNullable();
    table.string("phone_number").notNullable();
    table.string("profile_type").notNullable();
    table.string("food_business_name").notNullable();
    table.string("food_business_number").notNullable();
    table.string("food_business_license").notNullable();
    table.date("food_business_license_date_of_issue").notNullable();
    table.string("food_handler_certificate").notNullable();
    table.date("food_handler_certificate_date_of_issue").notNullable();
    table.date("food_handler_certificate_expiry_date").notNullable();
    table.string("food_business_insurance").notNullable();
    table.date("food_business_insurance_date_of_issue").notNullable();
    table.date("food_business_insurance_expiry_date").notNullable();
    table.string("food_business_logo");
    table.string("food_business_photo");
    table.text("food_business_story");
    table.boolean("certified");
    table.string("reject_note");
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("caterers");
};
