exports.up = function (knex) {
  return knex.schema.alterTable("orders", (table) => {
    table.string("details")
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("orders", (table) => {
    table.dropColumn("details");
  });
};
