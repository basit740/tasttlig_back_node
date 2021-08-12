exports.up = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    table.string("business_registered_location");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    table.dropColumn("business_registered_location");
  });
};
