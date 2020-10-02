exports.up = function(knex) {
  return knex.schema.renameTable('payment_bank', 'payment_info')
};

exports.down = function(knex) {
  return knex.schema.renameTable('payment_info', 'payment_bank')
};
