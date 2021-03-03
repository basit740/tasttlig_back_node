exports.up = function (knex){
    return knex("subscriptions")
    .where({subscription_code: "S_C2"})
    .update({price: 5000})

  };
    


exports.down = function (knex) {
    return knex.schema.table("subscriptions", () => {});
  };