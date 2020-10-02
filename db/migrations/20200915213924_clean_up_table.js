
exports.up = function(knex) {
  return knex.schema.dropTableIfExists('payment_stripe')
    .dropTableIfExists('payment_online_transfer')
    .dropTableIfExists('payment_paypal')
};

exports.down = function(knex) {
  
};
