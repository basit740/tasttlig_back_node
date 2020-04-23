"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("flagged_feedbacks", table => {
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
    table
      .bigInteger("feedback_id")
      .unsigned()
      .index()
      .references("id")
      .inTable("feedbacks")
      .onDelete("CASCADE");
    table.string("flagged_profile_img_url");
    table.string("flagged_first_name").notNullable();
    table.text("flagged_body").notNullable();
    table.text("feedback_body").notNullable();
    table.string("feedback_profile_img_url");
    table.string("feedback_first_name").notNullable();
    table.string("reply");
    table.boolean("archive").defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("flagged_feedbacks");
};
