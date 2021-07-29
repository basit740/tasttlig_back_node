exports.up = function(knex) {
    return knex.schema.alterTable("festivals", table => {
      table.specificType("festival_business_id", 'INT[]');
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("festivals", table => {
        table.dropColumn("festival_business_id");
    });
  };
  