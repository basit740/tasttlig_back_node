exports.up = function (knex) {
  return knex.schema.alterTable("passport", (table) => {
    table.specificType("food_preferences", "VARCHAR[]");
    table.specificType("food_allergies", "VARCHAR[]");
    table.renameColumn("country_id", "preferred_country_cuisine");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("passport", (table) => {
    table.dropColumn("food_preferences");
    table.dropColumn("food_allergies");
    table.dropColumn("preferred_country_cuisine");
  });
};
