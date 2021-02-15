


exports.up = function(knex) {
    return knex("subscriptions").where(
      
        {
          subscription_code: "F_SB"
        }
      ).update({status: "ACTIVE"});
  };
  
  exports.down = function (knex) {
    return knex.schema.table("subscriptions", () => {});
  };
  

