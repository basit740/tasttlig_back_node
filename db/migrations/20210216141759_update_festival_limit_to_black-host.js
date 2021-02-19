exports.up = function (knex){
    return knex("subscriptions")
    .where({subscription_code: "H_BLACK"})
    .update({fesitval_limit: 25})

  };
    


exports.down = function (knex) {
    return knex.schema.table("subscriptions", () => {});
  };