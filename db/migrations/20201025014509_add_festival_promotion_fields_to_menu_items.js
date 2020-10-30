exports.up = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table.boolean("include_in_festival").defaultTo(false);
    table.integer("samples_per_day");
  });
};

exports.down = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table.dropColumn("include_in_festival");
    table.dropColumn("samples_per_day");
  });
};
