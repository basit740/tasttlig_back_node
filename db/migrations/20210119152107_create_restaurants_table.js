exports.up = function (knex) {
  return knex.schema.createTable("restaurants", (table) => {
    table.increments("restaurant_id").unsigned().primary();
    table
      .integer("restaurant_user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table
      .integer("restaurant_food_samples_id")
      .unsigned()
      .index()
      .references("food_sample_id")
      .inTable("food_samples");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("restaurants");
};
