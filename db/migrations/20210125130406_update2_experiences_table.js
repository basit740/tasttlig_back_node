exports.up = function (knex) {
  return knex.schema.table("experiences", (tableBuilder) => {
    tableBuilder.dropColumn("experience_creator_user_id");
    tableBuilder.dropColumn("style");
    tableBuilder.dropColumn("start_date");
    tableBuilder.dropColumn("start_time");
    tableBuilder.dropColumn("end_date");
    tableBuilder.dropColumn("end_time");
    tableBuilder.dropColumn("menu_id");
    tableBuilder.dropColumn("dress_code");
    tableBuilder.dropColumn("address");
    tableBuilder.dropColumn("city");
    tableBuilder.dropColumn("state");
    tableBuilder.dropColumn("country");
    tableBuilder.dropColumn("postal_code");
    tableBuilder.dropColumn("review_experience_reason");
    tableBuilder.dropColumn("coordinates");
    tableBuilder.dropColumn("latitude");
    tableBuilder.dropColumn("longitude");
    tableBuilder.dropColumn("type");
    tableBuilder.dropColumn("is_food_service_requested");
    tableBuilder.dropColumn("is_entertainment_service_requested");
    tableBuilder.dropColumn("is_venue_service_requested");
    tableBuilder.dropColumn("is_transport_service_requested");
    tableBuilder.dropColumn("transport_description");
    tableBuilder.dropColumn("parking_description");
    tableBuilder.dropColumn("accessibility_description");
    tableBuilder.dropColumn("environmental_consideration_description");
    tableBuilder.dropColumn("value_description");
    tableBuilder.dropColumn("other_description");
    tableBuilder.dropColumn("is_restaurant_location");
    tableBuilder.dropColumn("game_description");
    tableBuilder.dropColumn("entertainment_description");
    tableBuilder.dropColumn("feature_description");
  });
};

exports.down = function (knex) {
  return knex.schema.table("experiences", (tableBuilder) => {
    tableBuilder.dropColumn("experience_creator_user_id");
    tableBuilder.dropColumn("style");
    tableBuilder.dropColumn("start_date");
    tableBuilder.dropColumn("start_time");
    tableBuilder.dropColumn("end_date");
    tableBuilder.dropColumn("end_time");
    tableBuilder.dropColumn("menu_id");
    tableBuilder.dropColumn("dress_code");
    tableBuilder.dropColumn("address");
    tableBuilder.dropColumn("city");
    tableBuilder.dropColumn("state");
    tableBuilder.dropColumn("country");
    tableBuilder.dropColumn("postal_code");
    tableBuilder.dropColumn("review_experience_reason");
    tableBuilder.dropColumn("coordinates");
    tableBuilder.dropColumn("latitude");
    tableBuilder.dropColumn("longitude");
    tableBuilder.dropColumn("type");
    tableBuilder.dropColumn("is_food_service_requested");
    tableBuilder.dropColumn("is_entertainment_service_requested");
    tableBuilder.dropColumn("is_venue_service_requested");
    tableBuilder.dropColumn("is_transport_service_requested");
    tableBuilder.dropColumn("transport_description");
    tableBuilder.dropColumn("parking_description");
    tableBuilder.dropColumn("accessibility_description");
    tableBuilder.dropColumn("environmental_consideration_description");
    tableBuilder.dropColumn("value_description");
    tableBuilder.dropColumn("other_description");
    tableBuilder.dropColumn("is_restaurant_location");
    tableBuilder.dropColumn("game_description");
    tableBuilder.dropColumn("entertainment_description");
    tableBuilder.dropColumn("feature_description");
  });
};
