exports.up = function(knex) {
    return knex.schema.createTable("user_reviews", table => {
    table.increments("review_id").unsigned().primary();
    table.integer("review_user_id").unsigned().index()
    .references("tasttlig_user_id").inTable("tasttlig_users").onDelete("CASCADE");
    table.string("review_user_email");
    table.integer("review_product_id").unsigned().index()
    .references("product_id").inTable("products").onDelete("CASCADE");
    table.integer("review_service_id").unsigned().index()
    .references("service_id").inTable("services").onDelete("CASCADE");
    table.integer("review_experience_id").unsigned().index()
    .references("experience_id").inTable("experiences").onDelete("CASCADE");
    table.integer("review_festival_id").unsigned().index()
    .references("festival_id").inTable("festivals").onDelete("CASCADE");
    table.string("review_status");
    table.integer("review_ask_count"); // max limit 3
    table.integer("food_quality_rating"); // rating the quality of product, service or experience
    table.integer("location_accessibility_rating"); // is the location easily accessible or not
    table.integer("overall_user_experience_rating");
    table.integer("taste_of_food_rating");
    table.string("venue_ambience_rating");
    table.dateTime("review_date_time");
    table.text("additional_comments");
         
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable("user_reviews", table => {
      
      
  });
};