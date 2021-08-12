exports.up = function (knex) {
  return knex.schema.createTable("orders", (table) => {
    table.increments("order_id").unsigned().primary();
    table
      .integer("order_by_user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.string("status");
    table.string("phone");
    table.string("address");
    table.string("city");
    table.string("state");
    table.string("country");
    table.string("postal_code");
    table.string("notes");
    table.decimal("total_amount_before_tax");
    table.decimal("total_tax");
    table.decimal("total_amount_after_tax");
    table.dateTime("start_datetime");
    table.dateTime("end_datetime");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("orders");
};
