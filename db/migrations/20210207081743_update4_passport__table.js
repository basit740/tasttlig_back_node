

exports.up = function(knex) {
    return knex.schema.alterTable("passport", table => {
      
      
      table.string("passport_id").unsigned().primary();
      
      table.specificType("country_id", 'INT[]');
      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("passport", table =>{
     
        table.dropColumn("passport_id");
        table.dropColumn("country_id");
    }
    );
  };
  



