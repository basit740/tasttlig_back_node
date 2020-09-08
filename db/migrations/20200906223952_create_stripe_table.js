
exports.up = function(knex) {
  return knex.schema.createTable("payment_stripe", table => {
    table.increments("payment_transfer_id").unsigned().primary();
    table.integer("user_id").notNullable().index()
      .references('tasttlig_user_id').inTable('tasttlig_users');
    table.string("stripe_account").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("payment_stripe")
};
