"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("experiences", table => {
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
    table.string("img_url_1").notNullable();
    // table.string("img_url_2").notNullable();
    // table.string("img_url_3").notNullable();
    table.string("title").notNullable();
    table.decimal("price").notNullable();
    table.string("category").notNullable();
    table.string("style").notNullable();
    table.string("start_date").notNullable();
    table.string("end_date").notNullable();
    table.string("start_time");
    table.string("end_time");
    table.integer("capacity").notNullable();
    table.string("dress_code").notNullable();
    table.string("address_line_1").notNullable();
    table.string("address_line_2");
    table.string("city").notNullable();
    table.string("province_territory").notNullable();
    table.string("postal_code").notNullable();
    table.text("description").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("experiences");
};
