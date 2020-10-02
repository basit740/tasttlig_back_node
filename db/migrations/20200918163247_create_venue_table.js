
exports.up = function(knex) {
  return knex.schema.createTable("venue", table => {
    table.increments("venue_id").unsigned().primary();
    table.integer("user_id").notNullable().index()
      .references("tasttlig_user_id").inTable("tasttlig_users");
    table.string("name");
    table.string("type");
    table.string("status");
    table.string("description");
    table.string("price");
    table.string("capacity");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("venue");
};
