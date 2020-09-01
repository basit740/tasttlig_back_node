
exports.up = function(knex) {
  return knex.schema.table("food_samples", table => {
    table.unique('food_ad_code');
  })
};

exports.down = function(knex) {
  return knex.schema.table("food_samples", table => {
    table.dropUnique('food_ad_code');
  })
};
