

exports.up = function(knex) {
    return knex.schema.alterTable("subscriptions", table => {
      
      
      
        table.integer("fesitval_limit");
          
      
           
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("subscriptions", table => {
        
        
        table.dropColumn("fesitval_limit");
         
        
    });
  };




  



