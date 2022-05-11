const Festival = require("../../models/festivals");
exports.up = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.string("category").defaultTo(Festival.Category.MultiCultural)
    table.string("sub_category")
    table.string("festival_address_1")
    table.string("festival_address_2")
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.dropColumn("category");
    table.dropColumn("sub_category");
    table.dropColumn("festival_address_1");
    table.dropColumn("festival_address_2");
  });
};
