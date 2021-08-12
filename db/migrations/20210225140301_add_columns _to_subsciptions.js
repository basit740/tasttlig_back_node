exports.up = function (knex) {
  return knex.schema.alterTable("subscriptions", (table) => {
    table.integer("products_services__sponsor_limit");
    table.integer("sponsoring_restaurants_limit");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("subscriptions", (table) => {
    table.dropColumn("products_services__sponsor_limit");
    table.dropColumn("sponsoring_restaurants_limit");
  });
};
