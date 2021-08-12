exports.up = function (knex) {
  return knex.schema.alterTable("food_sample_claims", (table) => {
    table.string("current_status");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("food_sample_claims", (table) => {
    table.dropColumn("current_status");
  });
};
