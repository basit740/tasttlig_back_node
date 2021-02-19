
exports.up = function(knex) {
    return knex("subscriptions").where(
      
        {
          subscription_code: "H_BLUE"
        }
      ).update({description: "Blue Host Package"});
  };
  
  exports.down = function (knex) {
    return knex.schema.table("subscriptions", () => {});
  };
