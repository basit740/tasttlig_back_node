exports.up = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    table.renameColumn("business_id", "business_details_id");
    table.renameColumn("user_id", "business_details_user_id");
    table.renameColumn("postal_code", "zip_postal_code");

    table.dateTime("business_details_created_at_datetime");
    table.dateTime("business_details_updated_at_datetime");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    table.dropColumn("business_id");
    table.dropColumn("user_id");
    table.dropColumn("postal_code");

    table.dropColumn("business_details_created_at_datetime");
    table.dropColumn("business_details_updated_at_datetime");
  });
};
