exports.up = function(knex) {
  return knex.schema.createTable("favourites", table => {
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
      .integer("festival_id")
      .unsigned()
      .references("festival_id")
      .inTable("festivals");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("favourites");
};
