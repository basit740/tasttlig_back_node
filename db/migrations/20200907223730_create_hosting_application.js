exports.up = function (knex) {
  return knex.schema.createTable("hosting_application", (table) => {
    table.increments("application_id").unsigned().primary();
    table
      .integer("user_id")
      .notNullable()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.string("reason", 1000).notNullable();
    table.string("video_link");
    table.string("youtube_link");
    table.string("status").notNullable();
    table.string("reviewer");
    table.string("review_feedback");
    table.dateTime("created_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("hosting_application");
};
