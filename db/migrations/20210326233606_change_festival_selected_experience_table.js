exports.up = async function (knex) {
  await knex.raw("update experiences set festival_selected = null");
  return knex.schema.alterTable("experiences", (table) => {
    table.specificType("festival_selected", "INT[]").alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("experiences", (table) => {
    table.specificType("festival_selected", "VARCHAR[]").alter();
  });
};
