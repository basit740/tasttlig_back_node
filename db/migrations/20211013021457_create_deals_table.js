exports.up = function(knex) {
  return knex.schema.createTable("deals", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table.string("name").notNullable();
    table.decimal("discount");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("deals");
};
