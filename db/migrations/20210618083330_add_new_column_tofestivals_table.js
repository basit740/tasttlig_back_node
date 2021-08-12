exports.up = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.decimal("festival_vendor_price");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.dropColumn("festival_vendor_price");
  });
};
