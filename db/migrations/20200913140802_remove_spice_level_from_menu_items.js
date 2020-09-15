exports.up = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table.dropColumn("spice_level");
  });
};

exports.down = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table.integer("spice_level");
  });
};
