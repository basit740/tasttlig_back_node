exports.up = function (knex) {
  return knex.schema.alterTable("experiences", (table) => {
    table.specificType("festival_selected", "VARCHAR[]");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("experiences", (table) => {
    table.dropColumn("festival_selected");
  });
};
