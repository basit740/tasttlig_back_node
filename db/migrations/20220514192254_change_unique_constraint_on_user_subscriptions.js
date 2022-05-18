exports.up = function (knex) {
  return knex.schema.alterTable("user_subscriptions", (table) => {
    table.dropUnique(['user_id', 'subscription_code']);
    table.unique(['user_id', 'subscription_code', 'user_subscription_status'])
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("user_subscriptions", (table) => {
    table.dropUnique(['user_id', 'subscription_code', 'user_subscription_status'])
    table.unique(['user_id', 'subscription_code']);
  });
};
