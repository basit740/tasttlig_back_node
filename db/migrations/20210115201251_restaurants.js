
exports.up = function(knex) {
    return knex.schema.createTable("dummy_table_1", table => {
      table.increments("restaurant_id").unsigned().primary();
      table.integer("restaurant_user_id");
      table.integer("restaurant_menu_id");
      table.integer("restaurants_specials_id");
      table.integer("restaurants_food_samples_id");
    });
};
  
  exports.down = function(knex) {
    return knex.schema.dropTable("dummy_table_1");
  };
