exports.up = function (knex) {
  return knex.schema.createTable("PassPort", (table) => {
    table.increments("passport_id").unsigned().primary();
    table.string("passport_unique_id").unique();
    table.specificType("preferred_country_cuisine", "VARCHAR[]");
    table.specificType("food_preferences", "VARCHAR[]");
    table.specificType("food_allergies", "VARCHAR[]");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("PassPort");
};
