exports.up = function (knex) {
  return knex.schema.table("food_sample_claims", function (t) {
    t.timestamp("reserved_on").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.table("food_sample_claims", function (t) {
    t.dropColumn("reserved_on");
  });
};
