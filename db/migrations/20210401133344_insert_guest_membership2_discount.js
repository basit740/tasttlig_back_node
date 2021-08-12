exports.up = function (knex) {
  return knex("subscriptions")
    .where({ subscription_code: "G_MSHIP2" })
    .update({ discount_for_members: 15 });
};

exports.down = function (knex) {
  return knex("subscriptions")
    .where({ subscription_code: "G_MSHIP2" })
    .update({ discount_for_members: null });
};
