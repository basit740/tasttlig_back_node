exports.up = function (knex) {
  return knex.schema.createTable("cart_items", (table) => {
    table.increments("cart_item_id").unsigned().primary();
    table
      .integer("cart_id")
      .notNullable()
      .index()
      .references("cart_id")
      .inTable("carts");
    table.string("status").notNullable();
    table.integer("experience_id").defaultTo(null);
    table.integer("quantity").notNullable();
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("cart_items");
};
