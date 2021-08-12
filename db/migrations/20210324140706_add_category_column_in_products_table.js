exports.up = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.string("product_category");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.dropColumn("product_category");
  });
};
