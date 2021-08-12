exports.up = function (knex) {
  return knex.schema.createTable("user_subscriptions", (table) => {
    table.increments("user_subscription_id").unsigned().primary();
    table
      .integer("user_id")
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table
      .string("subscription_code")
      .references("subscription_code")
      .inTable("subscriptions");
    table.dateTime("subscription_start_datetime");
    table.dateTime("subscription_end_datetime");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_subscriptions");
};
