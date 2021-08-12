exports.up = function (knex) {
  return knex.schema.createTable("forum_comments", (table) => {
    table.increments("comment_id").unsigned().primary();
    table
      .integer("post_id")
      .unsigned()
      .index()
      .references("post_id")
      .inTable("forum_posts");
    table
      .integer("comment_by_user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.text("body");
    table.boolean("is_enabled");
    table.dateTime("created_at_datetime").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("forum_comments");
};
