exports.up = function (knex) {
  return knex.schema.alterTable("user_reviews", (table) => {
    table.integer("overall_service_of_restaurant_rating");
    table.renameColumn("food_quality_rating", "authenticity_of_food_rating");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("user_reviews", (table) => {
    table.dropColumn("overall_service_of_restaurant_rating");
    table.dropColumn("authenticity_of_food_rating");
  });
};
