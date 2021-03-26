exports.up = function (knex) {
  return knex.schema.alterTable("hosts", (table) => {
    table.string("host_video_url");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("hosts", (table) => {
    table.dropColumn("host_video_url");
  });
};
