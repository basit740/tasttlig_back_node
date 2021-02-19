

exports.up = function(knex) {
    return knex.schema.alterTable("passport", table => {
      
      
      
        table.specificType("preferred_country_cuisine", 'VARCHAR[]');
          
      
           
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("passport", table => {
        
        
        table.dropColumn("preferred_country_cuisine");
         
        
    });
  };




  



