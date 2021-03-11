exports.up = function (knex){
    return knex("subscriptions")
    .where({subscription_code: "S_C3"})
    .update({price: 20000})

  };
    


exports.down = function (knex) {
    return knex.schema.table("subscriptions", () => {});
  };