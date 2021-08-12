exports.up = function (knex) {
  return knex("subscriptions")
    .where({ subscription_code: "H_RED" })
    .update({ fesitval_limit: 4 });
};

exports.down = function (knex) {
  return knex.schema.table("subscriptions", () => {});
};
