exports.up = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.specificType("festival_selected_pending", "INT[]");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.dropColumn("festival_selected_pending");
  });
};
