exports.up = async function (knex) {
  return knex.schema.alterTable("tasttlig_users", (table) => {
    table.boolean("created_by_admin");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("tasttlig_users", (table) => {
    table.dropColumn("created_by_admin");
  });
};
