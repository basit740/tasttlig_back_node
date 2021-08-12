exports.up = function (knex) {
  return knex.schema.table("tasttlig_users", (tableBuilder) => {
    tableBuilder.dropColumn("role");
  });
};

exports.down = function (knex) {
  return knex.schema.table("tasttlig_users", (tableBuilder) => {
    tableBuilder.string("role");
  });
};
