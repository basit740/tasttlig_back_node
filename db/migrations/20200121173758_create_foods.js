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
    table.string("img_url_1").notNullable();
    table.string("name").notNullable();
    table.string("food_ethnicity").notNullable();
    table.integer("price").notNullable();
    table.integer("quantity").notNullable();
    table.string("street_address").notNullable();
    table.string("city").notNullable();
    table.string("province_territory").notNullable();
    table.string("postal_code").notNullable();
    table.string("spice_level");
    table.boolean("vegetarian").defaultTo(false);
    table.boolean("vegan").defaultTo(false);
    table.boolean("gluten_free").defaultTo(false);
    table.boolean("halal").defaultTo(false);
    table.integer("ready_time").notNullable();
    table.string("time_type").notNullable();
    table.integer("delivery_fee").notNullable();
    table.text("description").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("foods");
};
