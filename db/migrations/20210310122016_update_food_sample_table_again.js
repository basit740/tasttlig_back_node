exports.up = function (knex) {
  return knex.schema.alterTable("food_samples", (table) => {
    table.integer("claimed_total_quantity");
    table.integer("redeemed_total_quantity");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("food_samples", (table) => {
    table.dropColumn("claimed_total_quantity");
    table.dropColumn("redeemed_total_quantity");
  });
};
