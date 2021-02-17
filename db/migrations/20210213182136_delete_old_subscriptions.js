

exports.up = function(knex) {
    return knex("subscriptions")
      
    
  };
  
  exports.down = function (knex) {
    return knex.schema.table("subscriptions", () => {});
  };
  
