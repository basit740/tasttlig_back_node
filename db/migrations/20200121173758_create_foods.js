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
    table.string("food_img_url").notNullable();
    table.string("name").notNullable();
    table.string("food_ethnicity").notNullable();
    table.integer("price").notNullable();
    table.integer("quantity").notNullable();
    table.string("food_street_address").notNullable();
    table.string("food_city").notNullable();
    table.string("food_province_territory").notNullable();
    table.string("food_postal_code").notNullable();
    table.string("spice_level");
    table.boolean("vegetarian").defaultTo(false);
    table.boolean("vegan").defaultTo(false);
    table.boolean("gluten_free").defaultTo(false);
    table.boolean("halal").defaultTo(false);
    table.integer("ready_time").notNullable();
    table.string("time_type").notNullable();
    table.text("description").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("foods");
};
