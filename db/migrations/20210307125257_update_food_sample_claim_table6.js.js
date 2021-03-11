exports.up = function(knex) {
  return knex.schema.alterTable("food_sample_claims", table => {
    table.string("foodsample_festival_name");
  });
};
exports.down = function(knex) {
  return knex.schema.alterTable("food_sample_claims", table => {
      table.dropColumn("foodsample_festival_name");
  });
};