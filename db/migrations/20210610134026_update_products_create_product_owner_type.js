exports.up = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.specificType("product_offering_type ", "VARCHAR[]");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.dropColumn("product_offering_type");
  });
};
