const { generateSlug } = require("../../functions/functions");

exports.up = async function (knex) {
  const festivals = await knex("festivals")
    .havingNull("slug")
    .groupBy("festival_id")
    .returning();
  festivals.map(async (festival) => {
    let slug = generateSlug(festival.festival_name);
    await knex("festivals").update("slug", slug).where(festival);
  });
};

exports.down = function (knex) {
  return Promise.resolve(null);
};
