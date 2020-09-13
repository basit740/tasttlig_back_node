exports.up = function (knex) {
  return knex.schema.table('food_sample_claims', function (t) {
    t.enu('status', ['pending', 'confirmed', 'redeemed'], {
      useNative: true,
      enumName: 'food_sample_claims_status'
    }).defaultTo('pending');
  });
};

exports.down = function (knex) {
  return knex.schema.table('food_sample_claims', function (t) {
    t.dropColumn('status');
  });
};