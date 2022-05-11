exports.up = function (knex) {
  return knex.schema.alterTable("payments", (table) => {
    table
      .integer("user_subscription_id")
      .references("user_subscription_id")
      .inTable("user_subscriptions");
    table.renameColumn("payment_vender", "vendor")
    table.renameColumn("payment_reference_number", "reference_id")
    table.renameColumn("payment_type", "payment_method")
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("payments", (table) => {
    table
      .dropColumn("user_subscription_id");
    table.renameColumn("vendor", "payment_vender")
    table.renameColumn("reference_id", "payment_reference_number")
    table.renameColumn("payment_method", "payment_type")
  });
};
