exports.up = function (knex) {
  return knex.schema.createTable("payment_online_transfer", (table) => {
    table.increments("payment_transfer_id").unsigned().primary();
    table
      .integer("user_id")
      .notNullable()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.string("transfer_email").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("payment_online_transfer");
};
