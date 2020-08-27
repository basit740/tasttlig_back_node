
exports.up = function(knex) {
  return knex.schema.table("food_samples", table => {
    table.string("food_ad_code", 4);
  });
};

exports.down = function(knex) {
  return knex.schema.table("food_samples", table => {
    table.dropColumn("food_ad_code");
  });
};
