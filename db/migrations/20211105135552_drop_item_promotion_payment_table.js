exports.up = function(knex) {
    return knex.schema.dropTable("item_promotion_payment");
  };
  
  exports.down = function(knex) {
    
    return knex.schema.createTable("item_promotion_payment", table => {
        table
          .increments("id")
          .unsigned()
          .primary();
        table
          .integer("business_id")
          .unsigned()
          .references("business_details_id")
          .inTable("business_details");
        table
          .integer("festival_id")
          .unsigned()
          .references("festival_id")
          .inTable("festivals");
        table.string("status");
        table.string("item_type");
        table.dateTime("created_at_datetime").notNullable();
        table.dateTime("updated_at_datetime").notNullable();
      });
  };
  