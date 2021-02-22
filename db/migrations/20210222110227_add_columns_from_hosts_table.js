
exports.up = function(knex) {
    return knex.schema.alterTable("hosts", table => {
           
      
        table.specificType("cuisine_type", 'VARCHAR[]');
        table.string("has_hosted_anything_before");
        
        
           
           
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("hosts", table => {
        
        
        table.dropColumn("cuisine_type");
        table.dropColumn("has_hosted_anything_before");
                                  
         
        
    });
  };
  
  
  
  
  
  
  
  
  
  