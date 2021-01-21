exports.up = function (knex) {
  return knex.schema.table("festivals", (table) => {
    table.text("festival_description");
  });
};

exports.down = function (knex) {
  return knex.schema.table("festivals", (table) => {
    table.dropColumn("festival_description");
  });
};
