
exports.up = function(knex) {
    return knex("subscriptions").where(
      
        {
          status: null
        }
      ).update({status: "ACTIVE"});
  };
  
  exports.down = function (knex) {
    return knex.schema.table("subscriptions", () => {});
  };