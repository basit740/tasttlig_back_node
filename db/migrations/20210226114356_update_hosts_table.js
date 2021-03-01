

exports.up = function(knex) {
    return knex.schema.alterTable("hosts", table => {
           
      
        table.string("has_hosted_other_things_before");
        
        
        
              
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("hosts", table => {
        
        
        table.dropColumn("has_hosted_other_things_before");
        
        
        
         
    });
  };
  
  
  
  
  
  
  
  
  
  