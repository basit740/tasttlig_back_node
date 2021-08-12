exports.up = function (knex) {
  return knex.schema.alterTable("tasttlig_users", (table) => {
    table.decimal("credit");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("tasttlig_users", (table) => {
    table.dropColumn("credit");
  });
};
