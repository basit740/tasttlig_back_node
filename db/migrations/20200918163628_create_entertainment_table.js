exports.up = function (knex) {
  return knex.schema.createTable("entertainment", (table) => {
    table.increments("entertainment_id").unsigned().primary();
    table
      .integer("user_id")
      .notNullable()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.string("name");
    table.string("type");
    table.string("upload_link");
    table.string("youtube_link");
    table.string("soundcloud_link");
    table.string("spotify_link");
    table.string("other_media_link");
    table.string("status");
    table.string("description");
    table.string("estimate_price_per_gig");
    table.string("duration_per_gig_in_minutes");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("entertainment");
};
