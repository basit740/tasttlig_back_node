exports.up = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.decimal("festival_sponsor_price");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.dropColumn("festival_sponsor_price");
  });
};
