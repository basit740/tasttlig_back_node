exports.up = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table.renameColumn("is_vegetartian", "is_vegetarian");
  });
};

exports.down = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table.dropColumn("is_vegetartian");
  });
};
