exports.up = function (knex) {
  return knex.schema.alterTable("tasttlig_users", (table) => {
    table.date("date_of_birth");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("tasttlig_users", (table) => {
    table.dropColumn("date_of_birth");
  });
};
