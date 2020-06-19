"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("tasttlig_newsletters", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table.string("email").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("tasttlig_newsletters");
};
