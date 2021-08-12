exports.up = async function (knex) {
  await knex.raw(
    "update subscriptions set validity_in_months = 1 where subscription_code in ('H_BASIC', 'H_VEND', 'H_AMB', 'G_BASIC', 'G_MSHIP', 'G_AMB')"
  );
};

exports.down = function (knex) {
  return knex.schema.table("subscriptions", () => {});
};
