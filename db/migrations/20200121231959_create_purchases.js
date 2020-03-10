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
    table
      .bigInteger("food_id")
      .unsigned()
      .index()
      .references("id")
      .inTable("foods")
      .onDelete("CASCADE");
    table.integer("amount").notNullable();
    table.string("receipt_email").notNullable();
    table.string("receipt_url").notNullable();
    table.string("fingerprint").notNullable();
    table.string("description").notNullable();
    table.string("shipping_address").notNullable();
    table.integer("quantity").notNullable();
    table.boolean("accept");
    table.text("reject_note");
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("purchases");
};
