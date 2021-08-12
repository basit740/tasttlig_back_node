exports.up = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.specificType("neighbourhood_sponsor_id", "INT[]");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.dropColumn("neighbourhood_sponsor_id");
  });
};
