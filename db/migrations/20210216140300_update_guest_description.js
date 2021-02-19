
exports.up = function(knex) {
    return knex("subscriptions").where(
      
        {
          subscription_code: "G_FB"
        }
      ).update({description: "Festival Booking Price for Guests"});
  };
  
  exports.down = function (knex) {
    return knex.schema.table("subscriptions", () => {});
  };
