

exports.up = function(knex) {
    return knex.schema.alterTable("vendors", table => {
           
      
        table.string("vendor_approval_status");
        table.datetime("vendor_approval_date");
        table.datetime("vendor_declined_date");
        
              
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("vendors", table => {
        
        
        table.dropColumn("vendor_approval_status");
        table.dropColumn("vendor_approval_date");
        table.dropColumn("vendor_declined_date");
        
         
    });
  };
  
  
  
  
  
  
  
  
  
  