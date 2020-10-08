exports.up = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table.dropColumn("image_url");
  });
};

exports.down = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table.string("image_url");
  });
};
