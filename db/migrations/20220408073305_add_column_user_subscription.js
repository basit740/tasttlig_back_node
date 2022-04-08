exports.up = function (knex) {
    return knex.schema.alterTable("user_subscriptions", (table) => {
      table.integer("business_id")
    });
  };
  exports.down = function (knex) {
    return knex.schema.alterTable("user_subscriptions", (table) => {
      table.dropColumn("business_id");
    });
  };
  