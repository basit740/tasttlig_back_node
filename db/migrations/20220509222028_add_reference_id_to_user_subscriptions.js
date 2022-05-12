exports.up = function (knex) {
  return knex.schema.alterTable("user_subscriptions", (table) => {
    table.string("reference_id")
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("user_subscriptions", (table) => {
    table.dropColumn("reference_id");
  });
};
