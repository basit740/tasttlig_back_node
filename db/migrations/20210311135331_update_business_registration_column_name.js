

exports.up = function(knex) {
    return knex.schema.alterTable("business_details", table => {
      
      
      
      
      table.renameColumn("business_details_created_at_datetime", "business_details_registration_date"); 
      
           
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("business_details", table => {
        
        
        
        table.dropColumn("business_details_registration_date");   
             
        
    });
  };




  



