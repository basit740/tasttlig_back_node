exports.up = function(knex) {
  return knex.schema.table("food_samples", table => {
    table.float("latitude");
    table.float("longitude");
  });
};

exports.down = function(knex) {
  return knex.schema.table("food_samples", table => {
    table.dropColumn("latitude");
    table.dropColumn("longitude");
  });
};
