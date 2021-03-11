exports.up = function(knex) {
  return knex.schema.alterTable("food_sample_claims", table => {
    table.string("claim_Viewable_id");
  });
};
exports.down = function(knex) {
  return knex.schema.alterTable("food_sample_claims", table => {
      table.dropColumn("claim_Viewable_id");
  });
};