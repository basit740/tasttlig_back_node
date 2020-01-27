"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("foods", table => {
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
    table.string("name").notNullable();
    table.string("food_ethnicity").notNullable();
    table.string("img_url_1").notNullable();
    table.string("img_url_2").notNullable();
    table.string("img_url_3").notNullable();
    table.decimal("price").notNullable();
    table.string("postal_code").notNullable();
    table.string("address_line_1").notNullable();
    table.string("address_line_2").notNullable();
    table.string("city").notNullable();
    table.string("province").notNullable();
    table.text("description").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("foods");
};
