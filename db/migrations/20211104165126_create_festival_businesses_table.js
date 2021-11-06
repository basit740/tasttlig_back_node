exports.up = function(knex) {
    return knex.schema.createTable("festival_businesses", table => {
      table
        .increments("id")
        .unsigned()
        .primary();
      table
        .integer("festival_id")
        .unsigned()
        .references("festival_id")
        .inTable("festivals");
      table
        .integer("business_id")
        .unsigned()
        .references("business_details_id")
        .inTable("business_details");
        table
        .integer("business_promotion_usage")
        .unsigned()
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("festival_businesses");
  };
  