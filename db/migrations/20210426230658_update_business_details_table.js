exports.up = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    table.string("CRA_business_number");
    table.string("business_preference");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    table.dropColumn("CRA_business_number");
    table.dropColumn("business_preference");
  });
};
