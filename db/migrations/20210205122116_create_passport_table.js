

exports.up = function(knex) {
    return knex.schema.createTable("passport", table => {
      
      table.increments("id");
      table.string("passport_id").unsigned().primary();
      
      table.specificType("country_id", 'INT[]');
      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("passport");
  };
  



