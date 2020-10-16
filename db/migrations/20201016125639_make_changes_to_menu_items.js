
exports.up = function(knex) {
  return knex.schema.table("menu_items", (table) => {
    table.dropColumn("quantity_type");
    table.dropColumn("start_date");
    table.dropColumn("start_time");
    table.dropColumn("end_date");
    table.dropColumn("discount");
    table.dropColumn("discount_type");
    table.dropColumn("is_verified");
    table.dropColumn("frequency");
    table.dropColumn("food_ad_code");
    table.dropColumn("food_sample_type");
    table.string("type");
    table.string("size");
    table.boolean("is_available_on_monday");
    table.boolean("is_available_on_tuesday");
    table.boolean("is_available_on_wednesday");
    table.boolean("is_available_on_thursday");
    table.boolean("is_available_on_friday");
    table.boolean("is_available_on_saturday");
    table.boolean("is_available_on_sunday");
  });
};

exports.down = function(knex) {
  return knex.schema.table("menu_items", (table) => {
    table.string("quantity_type");
    table.date("start_date");
    table.time("start_time");
    table.date("end_date");
    table.string("discount");
    table.string("discount_type");
    table.boolean("is_verified");
    table.string("frequency");
    table.string("food_ad_code");
    table.string("food_sample_type");
    table.dropColumn("type");
    table.dropColumn("size");
    table.dropColumn("is_available_on_monday");
    table.dropColumn("is_available_on_tuesday");
    table.dropColumn("is_available_on_wednesday");
    table.dropColumn("is_available_on_thursday");
    table.dropColumn("is_available_on_friday");
    table.dropColumn("is_available_on_saturday");
    table.dropColumn("is_available_on_sunday");
  });
};
