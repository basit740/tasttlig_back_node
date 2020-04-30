"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("flagged_forums", table => {
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
    table.string("flagged_email").notNullable();
    table.string("flagged_profile_img_url");
    table.string("flagged_first_name").notNullable();
    table.text("flagged_body").notNullable();
    table.string("post_profile_img_url");
    table.string("post_first_name").notNullable();
    table.text("post_title").notNullable();
    table.text("post_body").notNullable();
    table.string("post_img_url");
    table.string("reply");
    table.boolean("archive").defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("flagged_forums");
};
