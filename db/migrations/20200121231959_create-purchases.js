exports.up = function(knex) {
  return knex.schema.createTable("purchases", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table
      .bigInteger("user_id")
      .unsigned()
      .index()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("charge_id").notNullable();
    table.decimal("amount").notNullable();
    table.string("receipt_email").notNullable();
    table.string("receipt_url").notNullable();
    table.string("fingerprint").notNullable();
    table.integer("source_id").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("purchases");
};
