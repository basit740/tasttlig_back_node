exports.up = function(knex) {
    return knex.schema.createTable("neighbourhood_businesses", table => {
      table
        .increments("id")
        .unsigned()
        .primary();
      table
        .integer("neighbourhood_id")
        .unsigned()
        .references("neighbourhood_id")
        .inTable("neighbourhood");
      table
        .integer("user_id")
        .unsigned()
        .references("tasttlig_user_id")
        .inTable("tasttlig_users");
      table
        .integer("business_id")
        .unsigned()
        .references("business_details_id")
        .inTable("business_details");
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("neighbourhood_businesses");
  };
  