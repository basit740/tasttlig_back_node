"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("tasttlig_users", table => {
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
    table.string("verified").defaultTo(false);
    table.string("profile_img_url");
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("tasttlig_users");
};
