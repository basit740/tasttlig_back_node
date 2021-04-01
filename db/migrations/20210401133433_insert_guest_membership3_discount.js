exports.up = function (knex){
    return knex("subscriptions")
    .where({subscription_code: "G_MSHIP3"})
    .update({discount_for_members: 20})

  };
    


exports.down = function (knex) {
    return knex("subscriptions")
    .where({subscription_code: "G_MSHIP3"})
    .update({discount_for_members: null})
  };