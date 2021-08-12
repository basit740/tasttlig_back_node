exports.up = function (knex) {
  return knex.schema.table("product_images", (table) => {
    table.dropColumn("product_id");
  });
};

exports.down = function (knex) {
  return knex.schema.table("product_images", (table) => {
    table.integer("product_id");
  });
};
