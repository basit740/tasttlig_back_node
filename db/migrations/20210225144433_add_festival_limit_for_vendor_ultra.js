exports.up = function (knex){
    return knex("subscriptions")
    .where({subscription_code: "V_ULTRA"})
    .update({fesitval_limit: -1})

  };
    


exports.down = function (knex) {
    return knex.schema.table("subscriptions", () => {});
  };