
exports.up = function(knex) {
  return knex.schema.table("food_samples", (table) => {
    table.integer("original_food_sample_id");
  }).then(() => {
    return knex('food_samples')
      .update({
        original_food_sample_id: knex.raw(`??`, ['food_sample_id'])
      });
  });
};

exports.down = function(knex) {
  return knex.schema.table("food_samples", (table) => {
    table.dropColumn("original_food_sample_id");
  });
};
