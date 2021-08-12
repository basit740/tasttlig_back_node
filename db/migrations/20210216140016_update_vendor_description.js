exports.up = function (knex) {
  return knex("subscriptions")
    .where({
      subscription_code: "V_SB",
    })
    .update({ description: "Festival Vendor Basic Package" });
};

exports.down = function (knex) {
  return knex.schema.table("subscriptions", () => {});
};
