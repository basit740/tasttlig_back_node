exports.up = function (knex) {
  return knex.schema.alterTable("PassPort", (table) => {
    table
      .integer("passport_user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("PassPort", (table) => {
    table.dropColumn("passport_user_id");
  });
};
