exports.up = function (knex) {
  return knex.schema.table("products", (table) => {
    table.specificType("product_user_guest_id", "INT[]");
  });
};

exports.down = function (knex) {
  return knex.schema.table("products", (table) => {
    table.dropColumn("product_user_guest_id");
  });
};
