exports.up = function (knex) {
  return knex.schema.createTable("payments", (table) => {
    table.increments("payment_id").unsigned().primary();
    table
      .integer("order_id")
      .unsigned()
      .index()
      .references("order_id")
      .inTable("orders");
    table.string("payment_reference_number");
    table.string("payment_type");
    table.string("payment_vender");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("payments");
};
