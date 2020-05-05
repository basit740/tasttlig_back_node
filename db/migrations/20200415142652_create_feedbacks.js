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
    table.string("feedback_email").notNullable();
    table.string("feedback_first_name").notNullable();
    table.string("feedback_last_name").notNullable();
    table.string("food_ad_email").notNullable();
    table.string("food_ad_first_name").notNullable();
    table.string("food_ad_last_name").notNullable();
    table.string("food_ad_name").notNullable();
    table.integer("rating").notNullable();
    table.boolean("remove").defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("feedbacks");
};
