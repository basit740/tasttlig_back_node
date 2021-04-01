exports.up = function (knex){
    return knex("subscriptions")
    .where({subscription_code: "G_MSHIP1"})
    .update({discount_for_members: 5})

  };
    


exports.down = function (knex) {
    return knex("subscriptions")
    .where({subscription_code: "G_MSHIP1"})
    .update({discount_for_members: null})
  };