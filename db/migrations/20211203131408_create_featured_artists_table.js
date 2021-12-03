exports.up = function (knex) {
  return knex.schema.createTable("featured_artists", (table) => {
    table.increments("id").unsigned().primary();
    table.string("avatar");
    table.string("name");
    table.text("biography");
    table.string("website");
    table.text("description");
    table.boolean("featured")
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("featured_artists");
};
