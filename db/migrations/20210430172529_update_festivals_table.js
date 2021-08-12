exports.up = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.specificType("festival_host_id", "INT[]");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.dropColumn("festival_host_id");
  });
};
