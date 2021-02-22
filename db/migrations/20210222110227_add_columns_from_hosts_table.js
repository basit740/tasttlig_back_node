
exports.up = function(knex) {
    return knex.schema.alterTable("hosts", table => {
           
      
        table.specificType("cuisine_type", 'VARCHAR[]');
        table.specificType("has_hosted_anything_before", 'VARCHAR[]');
        
        
           
           
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("hosts", table => {
        
        
        table.dropColumn("cuisine_type");
        table.dropColumn("has_hosted_anything_before");
                                  
         
        
    });
  };
  
  
  
  
  
  
  
  
  
  