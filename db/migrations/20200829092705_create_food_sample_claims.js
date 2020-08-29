exports.up = function (knex) {
  return knex.schema.createTable("food_sample_claims", (table) => {
    table.increments("food_sample_claim_id").unsigned().primary();
    table.string("food_sample_claim_email");
    table
      .integer("food_sample_claim_user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table
      .integer("food_sample_id")
      .unsigned()
      .index()
      .references("food_sample_id")
      .inTable("food_samples");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("food_sample_claims");
};
