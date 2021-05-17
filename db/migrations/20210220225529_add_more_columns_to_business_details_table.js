exports.up = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    /* table.string("business_passport_id");
    table.string("business_street_number");
    table.string("business_street_name");
    table.string("business_unit");
    table.boolean("business_registered");
    table.boolean("retail_business");
    table.string("food_business_type");
    table.string("food_handlers_certificate"); */
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    /* table.dropColumn("business_passport_id");
    table.dropColumn("business_street_number");
    table.dropColumn("business_street_name");
    table.dropColumn("business_unit");
    table.dropColumn("business_registered");
    table.dropColumn("retail_business");
    table.dropColumn("food_business_type");
    table.dropColumn("food_handlers_certificate"); */
  });
};
