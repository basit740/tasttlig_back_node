exports.up = function(knex) {
    return knex.schema.alterTable("subscriptions", table => {
      table.double("discount_for_members");
      
 
    });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("subscriptions", table => {
        
        table.dropColumn("discount_for_members");
        
   
    });
  };