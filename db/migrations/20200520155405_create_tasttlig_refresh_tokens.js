"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("tasttlig_refresh_tokens", table => {
    table
      .increments()
      .unsigned()
      .primary();
    table
      .bigInteger("user_id")
      .unsigned()
      .index()
      .references("id")
      .inTable("tasttlig_users")
      .onDelete("CASCADE");
    table.string("refresh_token", 512);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("tasttlig_refresh_tokens");
};
