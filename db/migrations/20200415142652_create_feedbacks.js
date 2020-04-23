"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("feedbacks", table => {
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
    table
      .bigInteger("food_ad_id")
      .unsigned()
      .index()
      .references("id")
      .inTable("food_ads")
      .onDelete("CASCADE");
    table.text("body").notNullable();
    table.string("profile_img_url");
    table.string("first_name").notNullable();
    table.boolean("remove").defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("feedbacks");
};
