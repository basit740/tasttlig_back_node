exports.up = function (knex) {
  return knex.schema.table("sponsors", (tableBuilder) => {
    tableBuilder.dropColumn("sponsor_name");
    tableBuilder.dropColumn("sponsor_address_1");
    tableBuilder.dropColumn("sponsor_address_2");
    tableBuilder.dropColumn("sponsor_city");
    tableBuilder.dropColumn("sponsor_state");
    tableBuilder.dropColumn("sponsor_postal_code");
    tableBuilder.dropColumn("sponsor_country");
  });
};

exports.down = function (knex) {
  return knex.schema.table("sponsors", (tableBuilder) => {
    tableBuilder.string("sponsor_name");
    tableBuilder.string("sponsor_address_1");
    tableBuilder.string("sponsor_address_2");
    tableBuilder.string("sponsor_city");
    tableBuilder.string("sponsor_state");
    tableBuilder.string("sponsor_postal_code");
    tableBuilder.string("sponsor_country");
  });
};
