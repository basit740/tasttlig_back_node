exports.up = function (knex) {
  return knex.schema.alterTable("order_items", (table) => {
    table.string("item_name");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("order_items", (table) => {
    table.dropColumn("item_name");
  });
};
  