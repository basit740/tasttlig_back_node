exports.up = function (knex) {
  return knex.schema.createTable("stripe_accounts", (table) => {
    table.increments("stripe_account_id").unsigned().primary();
    table
      .integer("user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users")
      .onDelete("CASCADE");
    table.string("account_id");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("stripe_accounts");
};
