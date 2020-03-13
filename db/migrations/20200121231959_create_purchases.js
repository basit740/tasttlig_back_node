"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("purchases", table => {
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
    table.integer("cost").notNullable();
    table.string("receipt_email").notNullable();
    table.string("receipt_url").notNullable();
    table.string("fingerprint").notNullable();
    table.string("description").notNullable();
    table.integer("quantity").notNullable();
    table.string("order_code").notNullable();
    table.boolean("accept");
    table.text("reject_note");
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("purchases");
};
