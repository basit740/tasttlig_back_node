exports.up = function (knex) {
  return knex.schema.createTable("transportation", (table) => {
    table.increments("transportation_id").unsigned().primary();
    table
      .integer("user_id")
      .notNullable()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.string("make");
    table.string("model");
    table.string("year");
    table.string("color");
    table.string("capacity");
    table.string("charge_per_km");
    table.string("description");
    table.string("status");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("transportation");
};
