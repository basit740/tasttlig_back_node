exports.up = async function (knex) {
  await knex.raw("delete from food_sample_claims where food_sample_id > 0");
  return knex.schema.dropTable("food_sample_claims");
};

exports.down = function (knex) {
  return knex.schema.table("food_sample_claims");
};
