exports.up = function (knex) {
  return knex.schema.table("experiences", (tableBuilder) => {
    tableBuilder.dropColumn("category");
    tableBuilder.dropColumn("description");
    tableBuilder.string("type");
    tableBuilder.boolean("is_food_service_requested");
    tableBuilder.boolean("is_entertainment_service_requested");
    tableBuilder.boolean("is_venue_service_requested");
    tableBuilder.boolean("is_transport_service_requested");
    tableBuilder.text("food_description");
    tableBuilder.text("game_description");
    tableBuilder.text("entertainment_description");
    tableBuilder.text("feature_description");
    tableBuilder.text("transport_description");
    tableBuilder.text("parking_description");
    tableBuilder.text("accessibility_description");
    tableBuilder.text("environmental_consideration_description");
    tableBuilder.text("value_description");
    tableBuilder.text("other_description");
  });
};

exports.down = function (knex) {
  return knex.schema.table("experiences", (tableBuilder) => {
    tableBuilder.string("category");
    tableBuilder.text("description");
    tableBuilder.dropColumn("type");
    tableBuilder.dropColumn("is_food_service_requested");
    tableBuilder.dropColumn("is_entertainment_service_requested");
    tableBuilder.dropColumn("is_venue_service_requested");
    tableBuilder.dropColumn("is_transport_service_requested");
    tableBuilder.dropColumn("food_description");
    tableBuilder.dropColumn("game_description");
    tableBuilder.dropColumn("entertainment_description");
    tableBuilder.dropColumn("feature_description");
    tableBuilder.dropColumn("transport_description");
    tableBuilder.dropColumn("parking_description");
    tableBuilder.dropColumn("accessibility_description");
    tableBuilder.dropColumn("environmental_consideration_description");
    tableBuilder.dropColumn("value_description");
    tableBuilder.dropColumn("other_description");
  });
};
