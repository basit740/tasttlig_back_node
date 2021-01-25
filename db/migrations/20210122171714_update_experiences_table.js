
exports.up = function(knex) {
    return knex.schema.alterTable("experiences", table => {
      
      table.integer("experience_business_id").unsigned().index()
      .references("business_details_id").inTable("business_details");
      table.renameColumn("title", "experience_name");
      table.renameColumn("price", "experience_price");
      table.renameColumn("status", "experience_status");
      table.renameColumn("nationality_id", "experience_nationality_id");
      table.renameColumn("food_description", "experience_description");
      table.renameColumn("capacity", "experience_capacity");
      table.string("experience_size_scope");
      table.string("experience_code", [4]);
      table.integer("experience_festival_id").unsigned().index().references("festival_id").inTable("festivals");      
      table.dateTime("experience_created_at_datetime");
      table.dateTime("experience_updated_at_datetime");
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("experiences", table => {
        
        table.dropColumn("experience_creator_user_id");
        table.dropColumn("experience_business_id")
        table.dropColumn("title");
        table.dropColumn("price");
        table.dropColumn("style");
        table.dropColumn("start_date");
        table.dropColumn("start_time");
        table.dropColumn("end_date");
        table.dropColumn("end_time");
        table.dropColumn("menu_id");
        table.dropColumn("dress_code");
        table.dropColumn("status");
        table.dropColumn("address");
        table.dropColumn("city");
        table.dropColumn("state");
        table.dropColumn("country");
        table.dropColumn("postal_code");
        table.dropColumn("review_experience_reason");
        table.dropColumn("nationality_id");
        table.dropColumn("coordinates");
        table.dropColumn("latitude");
        table.dropColumn("longitude");
        table.dropColumn("type");
        table.dropColumn("is_food_service_requested");
        table.dropColumn("is_entertainment_service_requested");
        table.dropColumn("is_venue_service_requested");
        table.dropColumn("is_transport_service_requested");
        table.dropColumn("food_description");
        table.dropColumn("transport_description");
        table.dropColumn("parking_description");
        table.dropColumn("accessibility_description");
        table.dropColumn("environmental_consideration_description");
        table.dropColumn("value_description");
        table.dropColumn("other_description");
        table.dropColumn("is_restaurant_location");
        table.dropColumn("capacity");
        table.dropColumn("game_description");
        table.dropColumn("entertainment description");
        table.dropColumn("feature_description");
        table.dropColumn("experience_size_scope");
        table.dropColumn("experience_code");
        table.dropColumn("experience_festival_id");
        table.dropColumn("experience_created_at_datetime");
        table.dropColumn("experience_updated_at_datetime");
    });
  };
