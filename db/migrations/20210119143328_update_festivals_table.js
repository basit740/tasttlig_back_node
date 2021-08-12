exports.up = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.specificType("festival_user_admin_id", "INT[]");
    table.specificType("festival_restaurant_host_id", "INT[]");
    table.specificType("festival_business_sponsor_id", "INT[]");
    table.specificType("festival_user_guest_id", "INT[]");
    table.string("festival_type");
    table.decimal("festival_price");
    table.string("festival_city");
    table.time("festival_start_time");
    table.time("festival_end_time");
    table.dateTime("festival_created_at_datetime");
    table.dateTime("festival_updated_at_datetime");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.dropColumn("festival_user_admin_id");
    table.dropColumn("festival_restaurant_host_id");
    table.dropColumn("festival_business_sponsor_id");
    table.dropColumn("festival_user_guest_id");
    table.dropColumn("festival_type");
    table.dropColumn("festival_price");
    table.dropColumn("festival_city");
    table.dropColumn("festival_start_time");
    table.dropColumn("festival_end_time");
    table.dropColumn("festival_created_at_datetime");
    table.dropColumn("festival_updated_at_datetime");
  });
};
