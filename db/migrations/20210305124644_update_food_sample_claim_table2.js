exports.up = function(knex) {
  return knex.schema.alterTable("food_sample_claims", table => {
    table.integer("claimed_quantity");
  });
};
exports.down = function(knex) {
  return knex.schema.alterTable("food_sample_claims", table => {
      table.dropColumn("claimed_quantity");
  });
};