exports.up = function (knex) {
  return knex.schema.alterTable("payments", (table) => {
    table.decimal("amount");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("payments", (table) => {
    table.dropColumn("amount");
  });
};
