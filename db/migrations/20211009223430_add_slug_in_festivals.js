exports.up = function (knex) {
  return knex.schema.table("festivals", (table) => {
    table.string("slug");
  });
};

exports.down = function (knex) {
  return knex.schema.table("festivals", (table) => {
    table.dropColumn("slug");
  });
};
