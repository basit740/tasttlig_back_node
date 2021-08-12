exports.up = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.dropColumn("product_owner_type");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.dropColumn("product_owner_type");
  });
};
