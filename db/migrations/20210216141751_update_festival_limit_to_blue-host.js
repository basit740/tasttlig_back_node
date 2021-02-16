exports.up = function (knex){
    return knex("subscriptions")
    .where({subscription_code: "H_BLUE"})
    .update({fesitval_limit: 10})

  };
    


exports.down = function (knex) {
    return knex.schema.table("subscriptions", () => {});
  };