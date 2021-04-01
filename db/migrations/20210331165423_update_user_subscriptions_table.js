exports.up = function(knex) {
    return knex.schema.alterTable("user_subscriptions", table => {
      table.string("user_subscription_status").defaultTo(null);
      
 
    });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("user_subscriptions", table => {
        
        table.dropColumn("user_subscription_status");
        
   
    });
  };