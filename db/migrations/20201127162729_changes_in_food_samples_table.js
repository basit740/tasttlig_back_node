
exports.up = function(knex) {
  return knex.schema.table("food_samples", (table) => {
    table.integer("festival_id");
  }).then(() => {
    return knex("festivals")
      .select()
      .where("festival_name", "September 2020 Festival")
      .first()
      .then(september_festival => {
        return knex('food_samples')
          .update({
            festival_id: september_festival.festival_id
          });
      });
  });
};

exports.down = function(knex) {
  return knex.schema.table("food_samples", (table) => {
    table.dropColumn("festival_id");
  });
};
