exports.up = function (knex) {
  return knex.schema.alterTable("neighbourhood", (table) => {
    table.string("neighbourhood_continent")
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("neighbourhood", (table) => {
    table.dropColumn("neighbourhood_continent");
  });
};
