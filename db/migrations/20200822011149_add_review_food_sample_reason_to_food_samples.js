exports.up = function (knex) {
  return knex.schema.table("food_samples", (table) => {
    table.text("review_food_sample_reason");
  });
};

exports.down = function (knex) {
  return knex.schema.table("food_samples", (table) => {
    table.dropColumn("review_food_sample_reason");
  });
};
