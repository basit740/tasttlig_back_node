exports.up = function (knex) {
  return knex("subscriptions")
    .where({ subscription_code: "S_C1" })
    .update({ price: 1500 });
};

exports.down = function (knex) {
  return knex.schema.table("subscriptions", () => {});
};
