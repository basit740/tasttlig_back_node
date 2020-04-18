"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("purchases", table => {
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
    table.bigInteger("food_ad_number").notNullable();
    table.string("profile_img_url");
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("food_ad_img_url").notNullable();
    // table.integer("quantity").notNullable();
    table.string("description").notNullable();
    table.integer("cost").notNullable();
    table.string("food_ad_street_address").notNullable();
    table.string("food_ad_city").notNullable();
    table.string("food_ad_province_territory").notNullable();
    table.string("food_ad_postal_code").notNullable();
    table.string("food_ad_code").notNullable();
    table.string("phone_number").notNullable();
    table.string("food_ad_email").notNullable();
    table.string("receipt_email").notNullable();
    // table.string("receipt_url").notNullable();
    // table.string("fingerprint").notNullable();
    table.boolean("claimed");
    table.boolean("redeemed").defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("purchases");
};
