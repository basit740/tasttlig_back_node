exports.up = function (knex) {
  return knex.schema.table("tasttlig_users", (table) => {
    table.unique("passport_id");
  });
};

exports.down = function (knex) {
  return knex.schema.table("tasttlig_users", (table) => {
    table.dropUnique("passport_id");
  });
};
