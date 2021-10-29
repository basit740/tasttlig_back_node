exports.up = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.integer("festival_interested").defaultTo(0);
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.dropColumn("festival_interested");
  });
};
