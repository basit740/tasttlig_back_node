
exports.up = function(knex) {
    return knex.schema.createTable("neighbourhood", table => {
      table.increments("neighbourhood_id").unsigned().primary();
      table.integer("user_id").unsigned().index()
        .references("tasttlig_user_id").inTable("tasttlig_users")
        .onDelete("CASCADE");
      table.string("neighbourhood_name").notNullable();
      table.string("neighbourhood_city");
      table.string("neighbourhood_country");
      table.string("neighbourhood_post_code");
      table.string("neighbourhood_area_code");
      table.string("neighbourhood_description");
      table.string("neighbourhood_special_features");
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("neighbourhood");
  };
  