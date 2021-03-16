exports.up = function (knex) {
  return knex.schema.alterTable("tasttlig_users", (table) => {
    // table.specificType("preferred_country_cuisine", "VARCHAR[]");
    // table.specificType("food_preferences", "VARCHAR[]");
    // table.specificType("food_allergies", "VARCHAR[]");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("tasttlig_users", (table) => {
    table.dropColumn("preferred_country_cuisine");
    table.dropColumn("food_preferences");
    table.dropColumn("food_allergies");
  });
};
