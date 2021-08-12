exports.up = function (knex) {
  return knex.schema.table("business_details", (table) => {
    table.dropColumn("address");

    table.string("business_name");
    table.string("business_type");
    table.string("business_address_1");
    table.string("business_address_2");
    table.string("ethnicity_of_restaurant");
    table.string("business_registration_number");
    table.string("facebook");
    table.string("instagram");

    table.unique("user_id");
  });
};

exports.down = function (knex) {
  return knex.schema.table("business_details", (table) => {
    table.string("address");
    table.dropColumn("business_name");
    table.dropColumn("ethnicity_of_restaurant");
    table.dropColumn("business_address_1");
    table.dropColumn("business_address_2");
    table.dropColumn("business_type");
    table.dropColumn("business_registration_number");
    table.dropColumn("facebook");
    table.dropColumn("instagram");
    table.dropUnique("user_id");
  });
};
