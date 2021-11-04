exports.up = function (knex) {
  return knex.schema.createTable("user_follows_fest", (table) => {
    table.increments("id").unsigned().primary();
    table
      .integer("user_id")
      .unsigned()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table
      .integer("follow_id")
      .unsigned()
      .references("festival_id")
      .inTable("festivals");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_follows_fest");
};
