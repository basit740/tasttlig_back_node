const { generateRandomString } = require("../../functions/functions");

exports.up = async function (knex) {
  const festivals = await knex("festivals")
    .havingNull("promo_code")
    .groupBy("festival_id")
    .returning();
  festivals.map(async (festival) => {
    let promo_code = generateRandomString(10);
    let existing = await knex("festivals").select("promo_code");
    while (existing.includes(promo_code)) {
      promo_code = generateRandomString(10);
    }
    await knex("festivals").update("promo_code", promo_code).where(festival);
  });
};

exports.down = function (knex) {
  return Promise.resolve(null);
};
