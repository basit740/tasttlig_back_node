
exports.up = function(knex) {
  return knex.schema.table("venue", table => {
    table.string("unit");
    table.renameColumn("user_id", "creator_user_id");
    table.string("address");
    table.string("city");
    table.string("state");
    table.string("country");
    table.string("postal_code");
    table.specificType("coordinates", "geometry(point, 4326)");
    table.float("latitude");
    table.float("longitude");
  });
};

exports.down = function(knex) {
  return knex.schema.table("venue", table => {
    table.dropColumn("unit");
    table.renameColumn("creator_user_id", "user_id");
    table.dropColumn("address");
    table.dropColumn("city");
    table.dropColumn("state");
    table.dropColumn("country");
    table.dropColumn("postal_code");
    table.dropColumn("coordinates");
    table.dropColumn("latitude");
    table.dropColumn("longitude");
  });
};
