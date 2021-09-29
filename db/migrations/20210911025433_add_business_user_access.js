exports.up = function (knex) {
  return knex.schema.createTable("user_app_access", (table) => {
    table.increments("id").unsigned().primary();
    table
      .bigInteger("user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table
      .bigInteger("app_id")
      .unsigned()
      .references("id")
      .inTable("tasttlig_app");
    table.unique(["app_id", "user_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_app_access");
};
