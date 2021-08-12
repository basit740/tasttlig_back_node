exports.up = function (knex) {
  return knex.schema.alterTable("tasttlig_users", (table) => {
    table.integer("age");
    table.string("marital_status");
    table.renameColumn("user_address_line_1", "street_name");
    table.renameColumn("user_address_line_2", "street_number");
    table.string("apartment_no");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("tasttlig_users", (table) => {
    table.dropColumn("age");
    table.dropColumn("marital_status");
    table.dropColumn("user_address_line_1");
    table.dropColumn("user_address_line_2");
    table.dropColumn("apartment_no");
  });
};
