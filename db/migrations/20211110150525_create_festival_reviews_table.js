exports.up = function (knex) {
  return knex.schema.createTable("festival_reviews", (table) => {
    table.increments("id").unsigned().primary();
    table
      .integer("festival_id")
      .unsigned()
      .references("festival_id")
      .inTable("festivals");
    table
      .integer("user_id")
      .unsigned()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.string("first_name");
    table.string("last_name");
    table.integer("rating");
    table.text("comment");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("festival_reviews");
};
