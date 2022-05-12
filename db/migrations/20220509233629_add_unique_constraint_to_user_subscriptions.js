exports.up = function (knex) {
  return knex.schema.alterTable("user_subscriptions", (table) => {
    table.unique(['user_id', 'subscription_code']);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("user_subscriptions", (table) => {
    table.dropUnique(['user_id', 'subscription_code']);
  });
};
