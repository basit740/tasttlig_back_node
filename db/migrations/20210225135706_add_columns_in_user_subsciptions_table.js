exports.up = function (knex) {
  return knex.schema.alterTable("user_subscriptions", (table) => {
    table.specificType("suscribed_festivals", "INT[]");
    table.double("cash_payment_received");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("user_subscriptions", (table) => {
    table.dropColumn("suscribed_festivals");
    table.dropColumn("cash_payment_received");
  });
};
