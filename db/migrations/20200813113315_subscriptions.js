const {subscriptions} = require("../data/subscriptions");

exports.up = function(knex) {
  return knex.schema.createTable("subscriptions", table => {
    table.increments("subscription_id").unsigned().primary();
    table.string("subscription_code").unique();
    table.string("subscription_name");
    table.decimal("validity_in_months");
    table.decimal("price");
    table.string("description");
    table.string("status");
  }).then(() => {
    return knex("subscriptions").insert(subscriptions.map((s) => {
      return {
        subscription_code: s.subscription_code,
        subscription_name: s.subscription_name,
        validity_in_months: s.validity_in_months,
        price: s.price,
        description: s.description,
        status: s.status
      }
    }));
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable("subscriptions");
};
