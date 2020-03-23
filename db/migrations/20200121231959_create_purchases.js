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
    table.string("food_img_url").notNullable();
    table.string("profile_img_url");
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.integer("quantity").notNullable();
    table.string("description").notNullable();
    table.integer("cost").notNullable();
    table.integer("ready_time").notNullable();
    table.string("time_type").notNullable();
    table.string("order_code").notNullable();
    table.string("phone_number").notNullable();
    table.string("receipt_email").notNullable();
    table.string("receipt_url").notNullable();
    table.string("fingerprint").notNullable();
    table.boolean("accept");
    table.text("reject_note");
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("purchases");
};
