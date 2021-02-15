
exports.up = function(knex) {
    return knex.schema.alterTable("products", table => {
      
      
      
      table.string("product_type");
      
      table.specificType("product_festivals_id", 'INT[]');
      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("products", table => {
        
        
        table.dropColumn("product_type");
        table.dropColumn("product_festivals_id");    
        
    });
  };

