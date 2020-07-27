
exports.up = function(knex) {
  return knex.schema.createTable("forum_posts", table => {
    table.increments("post_id").unsigned().primary();
    table.integer("forum_by_user_id").unsigned().index()
      .references("tasttlig_user_id").inTable("tasttlig_users");
    table.string("title").notNullable();
    table.string("category").notNullable();
    table.string("body");
    table.string("method_of_transportation");
    table.string("image_url");
    table.dateTime("created_at_datetime").notNullable();
    table.dateTime("updated_at_datetime").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("forum_posts");
};
