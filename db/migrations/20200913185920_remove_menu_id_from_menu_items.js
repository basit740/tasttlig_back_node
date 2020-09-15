exports.up = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table.dropColumn("menu_id");
  });
};

exports.down = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table.integer("menu_id");
  });
};
