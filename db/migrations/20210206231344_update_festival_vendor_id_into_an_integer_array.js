

exports.up = function(knex) {
    return knex.schema.table("festivals", tableBuilder => {
      
      
        
        
      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table("festivals", tableBuilder => {
        
        
        tableBuilder.dropColumn("festival_vendor_id");
                      
        
        
    });
  };


