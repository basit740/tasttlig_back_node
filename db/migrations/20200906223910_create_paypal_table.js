
exports.up = function(knex) {
  return knex.schema.createTable("payment_paypal", table => {
    table.increments("payment_paypal_id").unsigned().primary();
    table.integer("user_id").notNullable().index()
      .references('tasttlig_user_id').inTable('tasttlig_users');
    table.string("paypal_email").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("payment_paypal")
};
