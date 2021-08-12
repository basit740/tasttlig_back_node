exports.up = function (knex) {
  return knex.schema.alterTable("all_products", (table) => {
    table.string("product_category");
    table.string("product_manufacture_date");
    table.renameColumn("sample_size", "product_size");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("all_products", (table) => {
    table.dropColumn("product_category");
    table.dropColumn("product_manufacture_date");
    table.dropColumn("product_size");
  });
};
