exports.up = function (knex) {
  return knex.schema.alterTable("tasttlig_users", (table) => {
    table.string("sex");
    table.string("occupation");
    table.specificType("user_preference", "VARCHAR[]");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("tasttlig_users", (table) => {
    table.dropColumn("sex");
    table.dropColumn("occupation");
    table.dropColumn("user_preference");
  });
};
