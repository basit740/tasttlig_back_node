exports.up = function (knex) {
  return knex.schema.table("tasttlig_users", (table) => {
    table.renameColumn("address_line_1", "user_address_line_1");
    table.renameColumn("address_line_2", "user_address_line_2");
    table.renameColumn("city", "user_city");
    table.renameColumn("state", "user_state");
    table.renameColumn("postal_code", "user_postal_code");
  });
};

exports.down = function (knex) {
  return knex.schema.table("tasttlig_users", (table) => {
    table.dropColumn("address_line_1");
    table.dropColumn("address_line_2");
    table.dropColumn("city");
    table.dropColumn("state");
    table.dropColumn("postal_code");
  });
};
