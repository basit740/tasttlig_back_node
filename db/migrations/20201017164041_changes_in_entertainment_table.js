
exports.up = function(knex) {
  return knex.schema.table("entertainment", table => {
    table.string("genre");
    table.string("nationality_id");
    table.dropColumn("estimate_price_per_gig");
    table.dropColumn("duration_per_gig_in_minutes");
    table.renameColumn("user_id", "creator_user_id");
    table.renameColumn("name", "title");
  });
};

exports.down = function(knex) {
  return knex.schema.table("entertainment", table => {
    table.dropColumn("genre");
    table.dropColumn("nationality_id");
    table.string("estimate_price_per_gig");
    table.string("duration_per_gig_in_minutes");
    table.renameColumn("creator_user_id", "user_id");
    table.renameColumn("title", "name");
  });
};
