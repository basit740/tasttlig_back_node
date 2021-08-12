exports.up = (knex) => {
  return knex.schema.alterTable("payment_info", (table) => {
    table.string("bank_number").nullable().alter();
    table.string("account_number").nullable().alter();
    table.string("institution_number").nullable().alter();
    table.string("void_cheque").nullable().alter();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable("payment_info", (table) => {
    table.string("bank_number").notNullable().alter();
    table.string("account_number").notNullable().alter();
    table.string("institution_number").notNullable().alter();
    table.string("void_cheque").notNullable().alter();
  });
};
