
exports.up = function(knex) {
  return knex.schema.table("food_samples", table => {
    table.dropColumn("frequency");
    table.string("sample_size");
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
  return knex.schema.table("food_samples", table => {
    table.string("frequency");
    table.dropColumn("sample_size");
    table.dropColumn("is_available_on_monday");
    table.dropColumn("is_available_on_tuesday");
    table.dropColumn("is_available_on_wednesday");
    table.dropColumn("is_available_on_thursday");
    table.dropColumn("is_available_on_friday");
    table.dropColumn("is_available_on_saturday");
    table.dropColumn("is_available_on_sunday");
  });
};
