exports.up = function (knex) {
  return knex.schema.createTable("external_review", (table) => {
    table.increments("external_review_id").unsigned().primary();
    table
      .integer("user_id")
      .notNullable()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.string("platform").notNullable();
    table.string("link");
    table.string("text");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("external_review");
};
