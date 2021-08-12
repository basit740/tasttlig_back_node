exports.up = function (knex) {
  return knex.schema.table("tasttlig_users", (tableBuilder) => {
    tableBuilder.string("status").notNullable().defaultTo("ACTIVE");
  });
};

exports.down = function (knex) {
  return knex.schema.table("tasttlig_users", (tableBuilder) => {
    tableBuilder.dropColumn("status");
  });
};
