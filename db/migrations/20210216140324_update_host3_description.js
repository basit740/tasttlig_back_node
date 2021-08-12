exports.up = function (knex) {
  return knex("subscriptions")
    .where({
      subscription_code: "H_BLACK",
    })
    .update({ description: "Black Host Package" });
};

exports.down = function (knex) {
  return knex.schema.table("subscriptions", () => {});
};
