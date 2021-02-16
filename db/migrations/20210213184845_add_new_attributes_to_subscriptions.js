

exports.up = function(knex) {
    return knex.schema.alterTable("subscriptions", table => {
      
      
      table.decimal("payment_receivable_per_food_sample");
      table.boolean("can_sell_food_directly_to_guests");      
      table.boolean("can_sell_food_experiences_to_guests");
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("subscriptions", table => {
        
        table.dropColumn("payment_receivable_per_food_sample");
        table.dropColumn("can_sell_food_directly_to_guests");
        table.dropColumn("can_sell_food_experiences_to_guests");
        
    });
  };
