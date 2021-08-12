exports.up = function (knex) {
  return knex("subscriptions")
    .where({
      subscription_code: "H_RED",
    })
    .update({ description: "Red Host Package" });
};

exports.down = function (knex) {
  return knex.schema.table("subscriptions", () => {});
};
