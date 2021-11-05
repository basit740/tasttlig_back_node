exports.up = async function (knex) {
  const businesses = await knex("business_details")
    .havingNotNull("business_festival_id")
    .groupBy("business_details_id")
    .returning();
  businesses.map(async (business) => {

    let business_id = business.business_details_id;
    let festivals = business.business_festival_id;
    festivals.map(async (festival) => {
        let festival_id = festival;
        let row = {festival_id: festival_id, business_id: business_id, business_promotion_usage: 3};
        return knex('festival_businesses').insert(row);
    });
  });
};

exports.down = function (knex) {
  return knex.raw('delete from festival_businesses;')
};
