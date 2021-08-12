exports.up = function (knex) {
  return knex.schema.alterTable("subscriptions", (table) => {
    table.decimal("comission_to_pay");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("subscriptions", (table) => {
    table.dropColumn("comission_to_pay");
  });
};
