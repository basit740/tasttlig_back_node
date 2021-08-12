exports.up = function (knex) {
  return knex.schema.table("entertainment", (table) => {
    table.string("media_link");
    table.dropColumn("youtube_link");
    table.dropColumn("soundcloud_link");
    table.dropColumn("spotify_link");
    table.dropColumn("other_media_link");
    table.dropColumn("upload_link");
  });
};

exports.down = function (knex) {
  return knex.schema.table("entertainment", (table) => {
    table.dropColumn("media_link");
    table.string("youtube_link");
    table.string("soundcloud_link");
    table.string("spotify_link");
    table.string("other_media_link");
    table.string("upload_link");
  });
};
