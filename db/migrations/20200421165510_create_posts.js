"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("posts", table => {
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
    table.string("category").notNullable();
    table.string("method_of_transportation");
    table.string("title").notNullable();
    table.text("body").notNullable();
    table.string("post_img_url");
    table.string("profile_img_url");
    table.string("first_name");
    table.string("last_name");
    table.string("email");
    table.string("phone_number");
    table.boolean("remove").defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("posts");
};
