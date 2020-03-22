"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("recommendations", table => {
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
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.text("description").notNullable();
    table.text("reply");
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("recommendations");
};
