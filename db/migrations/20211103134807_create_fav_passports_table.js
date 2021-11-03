exports.up = function(knex) {
  return knex.schema.createTable("fav_passports", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table
      .integer("user_id")
      .unsigned()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table
      .integer("passport_id")
      .unsigned()
      .references("id")
      .inTable("passports");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("fav_passports");
};
