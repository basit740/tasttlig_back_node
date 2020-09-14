exports.up = function (knex) {
  return knex.schema.table("food_samples", (table) => {
    table.boolean("is_vegetarian");
    table.boolean("is_vegan");
    table.boolean("is_gluten_free");
    table.boolean("is_halal");
    table.string("spice_level");
  });
};

exports.down = function (knex) {
  return knex.schema.table("food_samples", (table) => {
    table.dropColumn("is_vegetarian");
    table.dropColumn("is_vegan");
    table.dropColumn("is_gluten_free");
    table.dropColumn("is_halal");
    table.dropColumn("spice_level");
  });
};
