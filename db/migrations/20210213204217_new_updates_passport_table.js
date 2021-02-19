

exports.up = function(knex) {
    return knex.schema.alterTable("ticket_details", table => {
      
      
      
      table.string("tikcet_booking_confirmation_id").unique();
      
           
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("ticket_details", table => {
        
        
        table.dropColumn("tikcet_booking_confirmation_id");     
            
        
        
    });
  };




  



