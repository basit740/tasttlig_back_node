exports.up = async function (knex) {
  await knex.raw("update subscriptions set validity_in_months = null");
  return knex.schema.alterTable("subscriptions", (table) => {
    table.integer("validity_in_months").alter();
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("food_samples", (table) => {
    table.double("validity_in_months").alter();
  });
};
