exports.up = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.string("product_creator_type");
    table
      .integer("product_user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.dropColumn("product_creator_type");
    table.dropColumn("product_user_id");
  });
};
