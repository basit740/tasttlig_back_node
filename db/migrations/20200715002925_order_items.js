
exports.up = function(knex) {
  return knex.schema.createTable("order_items", table => {
    table.increments("order_item_id").unsigned().primary();
    table.integer("order_id").unsigned().index()
      .references("order_id").inTable("orders");
    table.integer("item_id");
    table.string("item_type");
    table.integer("quantity");
    table.decimal("price_before_tax");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("order_items");
};
