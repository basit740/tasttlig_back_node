
exports.up = function(knex) {
  return knex.schema.createTable("party_supply", table => {
    table.increments("party_supply_id").unsigned().primary();
    table.integer("user_id").notNullable().index()
      .references("tasttlig_user_id").inTable("tasttlig_users");
    table.string("name");
    table.string("type");
    table.string("description");
    table.string("status");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("party_supply");
};
