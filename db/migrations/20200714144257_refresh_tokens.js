
exports.up = function(knex) {
  return knex.schema.createTable("refresh_tokens", table => {
    table.increments("refresh_token_id").unsigned().primary();
    table.integer("user_id").unsigned().index()
      .references("tasttlig_user_id").inTable("tasttlig_users");
    table.string("refresh_token", 2048).notNullable();
    table.dateTime("created_at_datetime").notNullable();
    table.dateTime("updated_at_datetime").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("refresh_tokens");
};
