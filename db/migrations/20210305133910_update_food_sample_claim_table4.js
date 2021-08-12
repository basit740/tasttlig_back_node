exports.up = function (knex) {
  return knex.schema.alterTable("food_sample_claims", (table) => {
    table.dropColumn("claim-Viewable_id");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("food_sample_claims", (table) => {
    table.dropColumn("claim-Viewable_id");
  });
};
