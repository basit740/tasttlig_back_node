exports.up = function (knex) {
  return knex.schema.alterTable("hosting_application", function (table) {
    table.dateTime("updated_at");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("hosting_application", function (table) {
    table.dropColumn("updated_at");
  });
};
