

exports.up = function(knex) {
    return knex.schema.table("ticket_details", tableBuilder => {
        tableBuilder.dropColumn("booking_confirmation_id");
        
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.table("ticket_details", tableBuilder => {
      tableBuilder.string("booking_confirmation_id");
      
    })
  };
