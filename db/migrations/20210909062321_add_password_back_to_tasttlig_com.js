exports.up = function (knex) {
  return knex.schema.table("tasttlig_users", (table) => {
    table.string("password_digest").nullable(false).default("");
  });
};

exports.down = function (knex) {
  return knex.schema.table("tasttlig_users", (table) => {
    table.dropColumn("password_digest");
  });
};
