"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("tasttlig_messages", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table.string("name").notNullable();
    table.string("email").notNullable();
    table.string("phone_number").notNullable();
    table.text("message").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("tasttlig_messages");
};
