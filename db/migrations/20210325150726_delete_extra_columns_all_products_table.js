exports.up = function (knex) {
  return knex.schema.table("all_products", (table) => {
    table.dropColumn("start_date");
    table.dropColumn("end_date");
    table.dropColumn("address");
    table.dropColumn("city");
    table.dropColumn("state");
    table.dropColumn("country");
    table.dropColumn("postal_code");
    table.dropColumn("review_food_sample_reason");
    table.dropColumn("coordinates");
    table.dropColumn("latitude");
    table.dropColumn("longitude");
    table.dropColumn("food_sample_entries");
    table.dropColumn("festival_id");
    table.dropColumn("original_food_sample_id");
  });
};

exports.down = function (knex) {
  return knex.schema.table("all_products", (table) => {});
};
