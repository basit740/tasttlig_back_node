exports.up = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.integer("deal_id")
    .unsigned()
    .index()
    .references("id")
    .inTable("deals");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.dropColumn("deal_id");
  });
};
