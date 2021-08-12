exports.up = function (knex) {
  return knex.schema.table("tasttlig_users", (table) => {
    table.dropColumn("address");
  });
};

exports.down = function (knex) {
  return knex.schema.table("tasttlig_users", (table) => {
    table.string("address");
  });
};
