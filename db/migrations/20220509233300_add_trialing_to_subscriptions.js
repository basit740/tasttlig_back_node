exports.up = function (knex) {
  return knex.schema.alterTable("subscriptions", (table) => {
    table.string("trial_period").defaultTo(0)
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("subscriptions", (table) => {
    table.dropColumn("trial_period");
  });
};
