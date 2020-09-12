
exports.up = function(knex) {
  return knex.schema.createTable("payment_bank", table => {
    table.increments("payment_bank_id").unsigned().primary();
    table.integer("user_id").notNullable().index()
      .references('tasttlig_user_id').inTable('tasttlig_users');
    table.string("bank_number").notNullable();
    table.string("account_number").notNullable();
    table.string("institution_number").notNullable();
    table.string("void_cheque").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("payment_bank")
};
