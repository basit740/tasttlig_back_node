exports.up = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table
      .integer("food_sample_creater_user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.renameColumn("name", "title");
    table.date("start_date");
    table.time("start_time");
    table.date("end_date");
    table.time("end_time");
    table.string("status");
    table.string("address");
    table.string("city");
    table.string("state");
    table.string("postal_code");
    table.string("country");
    table
      .integer("nationality_id")
      .unsigned()
      .index()
      .references("id")
      .inTable("nationalities");
    table.string("frequency");
    table.string("food_ad_code", 4);
    table.specificType("coordinates", "geometry(point, 4326)");
    table.float("latitude");
    table.float("longitude");
    table.string("food_sample_type");
  });
};

exports.down = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table.dropColumn("food_sample_creater_user_id");
    table.dropColumn("name");
    table.dropColumn("start_date");
    table.dropColumn("start_time");
    table.dropColumn("end_date");
    table.dropColumn("end_time");
    table.dropColumn("status");
    table.dropColumn("address");
    table.dropColumn("city");
    table.dropColumn("state");
    table.dropColumn("postal_code");
    table.dropColumn("country");
    table.dropColumn("nationality_id");
    table.dropColumn("frequency");
    table.dropColumn("food_ad_code");
    table.dropColumn("coordinates");
    table.dropColumn("latitude");
    table.dropColumn("longitude");
    table.dropColumn("food_sample_type");
  });
};
