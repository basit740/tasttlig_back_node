exports.up = function (knex) {
  return knex.schema.alterTable("passport_details", (table) => {
    table.integer("food_samples_claimed");
    table.integer("food_samples_redeemed");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("passport_details", (table) => {
    table.integer("food_samples_claimed");
    table.integer("food_samples_redeemed");
  });
};
