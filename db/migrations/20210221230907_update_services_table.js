
exports.up = function(knex) {
    return knex.schema.alterTable("services", table => {
           
      
        table.specificType("service_festivals_id", 'INT[]');
           
           
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("services", table => {
        
        
        table.dropColumn("service_festivals_id");
                           
         
        
    });
  };




  




