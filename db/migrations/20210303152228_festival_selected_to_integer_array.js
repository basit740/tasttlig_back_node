exports.up = async function (knex) {
  await knex.raw("update food_samples set festival_selected = null");
  return knex.schema.alterTable("food_samples", (table) => {
    table.specificType("festival_selected", "INT[]").alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("food_samples", (table) => {
    table.specificType("festival_selected", "VARCHAR[]").alter();
  });
};
