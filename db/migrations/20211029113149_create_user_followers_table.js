exports.up = function (knex) {
  return knex.schema.createTable("user_followers", (table) => {
    table.increments("id").unsigned().primary();
    table
      .integer("user_id")
      .unsigned()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table
      .integer("follower_id")
      .unsigned()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_followers");
};
