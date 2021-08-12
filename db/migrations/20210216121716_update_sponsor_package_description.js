exports.up = function (knex) {
  return knex("subscriptions")
    .where({
      subscription_code: "F_SB",
    })
    .update({ description: "Festival Sponsorship Basic Package" });
};

exports.down = function (knex) {
  return knex.schema.table("subscriptions", () => {});
};
