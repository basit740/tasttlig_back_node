exports.up = function (knex) {
  return knex.schema.table("food_samples", (table) => {
    table.string("food_sample_entries");
    table.integer("quantity");
    table.decimal("price");
  });
};

exports.down = function (knex) {
  return knex.schema.table("food_samples", (table) => {
    table.dropColumn("food_sample_entries");
    table.dropColumn("quantity");
  });
};
