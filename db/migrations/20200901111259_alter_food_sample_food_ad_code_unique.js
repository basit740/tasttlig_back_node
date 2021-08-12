const { generateRandomString } = require("../../functions/functions");
exports.up = async function (knex) {
  const duplicate_food_ad_code = await knex.raw(
    "select f1.food_sample_id from food_samples as f1, food_samples as f2 " +
      "where f1.food_ad_code = f2.food_ad_code and f1.food_sample_id != f2.food_sample_id"
  );
  for (let i = 0; i < duplicate_food_ad_code.rows.length; i++) {
    const id = duplicate_food_ad_code.rows[i].food_sample_id;
    await knex("food_samples")
      .update({ food_ad_code: generateRandomString(4) })
      .where("food_sample_id", "=", id);
  }

  return knex.schema.table("food_samples", (table) => {
    table.unique("food_ad_code");
  });
};

exports.down = function (knex) {
  return knex.schema.table("food_samples", (table) => {
    table.dropUnique("food_ad_code");
  });
};
