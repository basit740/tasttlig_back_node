"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("comments", table => {
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
      .bigInteger("post_id")
      .unsigned()
      .index()
      .references("id")
      .inTable("posts")
      .onDelete("CASCADE");
    table.text("body").notNullable();
    table.string("profile_img_url");
    table.string("first_name").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("comments");
};
