

exports.up = function(knex) {
    return knex("subscriptions").whereIn(
        'subscription_id', [1,2,3,4,5,6,7,8,9,10,11,12,13] 
        ).del()
      
    
  };
  
  exports.down = function (knex) {
    return knex.schema.table("subscriptions", () => {});
  };
  
