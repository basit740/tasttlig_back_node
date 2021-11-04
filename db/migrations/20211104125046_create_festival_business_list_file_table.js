exports.up = function(knex) {
    return knex.schema.createTable("festival_business_lists", table => {
      table
        .increments("list_id")
        .unsigned()
        .primary();
      table
        .integer("list_festival_id")
        .unsigned()
        .references("festival_id")
        .inTable("festivals");
      table.string("list_file_location");
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("festival_business_lists");
  };
  