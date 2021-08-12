exports.up = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.date("product_manufacture_date");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.dropColumn("product_manufacture_date");
  });
};
