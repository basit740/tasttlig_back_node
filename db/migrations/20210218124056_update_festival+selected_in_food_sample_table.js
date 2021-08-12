exports.up = function (knex) {
  return knex.schema.alterTable("food_samples", (table) => {
    table.specificType("festival_selected", "VARCHAR[]");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("food_samples", (table) => {
    table.dropColumn("festival_selected");
  });
};
