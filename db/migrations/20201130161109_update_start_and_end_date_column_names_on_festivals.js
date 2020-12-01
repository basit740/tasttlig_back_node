exports.up = function (knex) {
  return knex.schema.table("festivals", (table) => {
    table.renameColumn("start_date", "festival_start_date");
    table.renameColumn("end_date", "festival_end_date");
  });
};

exports.down = function (knex) {
  return knex.schema.table("festivals", (table) => {
    table.dropColumn("start_date");
    table.dropColumn("end_date");
  });
};
