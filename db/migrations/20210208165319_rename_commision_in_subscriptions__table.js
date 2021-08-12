exports.up = function (knex) {
  return knex.schema.alterTable("subscriptions", (table) => {
    table.renameColumn("comission_to_pay", "comission_to_pay_percentage");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("subscriptions", (table) => {
    table.dropColumn("comission_to_pay");
  });
};
