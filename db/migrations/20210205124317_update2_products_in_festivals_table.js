exports.up = function(knex) {
    return knex.schema.table("products", tableBuilder => {
      
      
      
      tableBuilder.dropColumn("product_festival_id");
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table("products", tableBuilder => {
        
        
        tableBuilder.dropColumn("product_festival_id");
        
        
    });
  };