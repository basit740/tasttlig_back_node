exports.up = function (knex) {
  return knex.schema.table("applications", (table) => {
    table.string("type").defaultTo("host");
    table.string("resume");
  });
};

exports.down = function (knex) {
  return knex.schema.table("menu_items", (table) => {
    table.dropColumn("type");
    table.dropColumn("resume");
  });
};
