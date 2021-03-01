


exports.up = function(knex) {
    return knex("subscriptions").where(
        { 
        subscription_code: "H_FCB",
        
        }).del()
      
    
  };
  
  

  exports.down = function (knex) {
    return knex.schema.table("subscriptions", () => {});
  };
  
  
