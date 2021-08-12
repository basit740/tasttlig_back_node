exports.up = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    table.dateTime("business_detail_approval_date");
    table.dateTime("business_detail_expiry_date");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    table.dropColumn("business_detail_approval_date");
    table.dropColumn("business_detail_expiry_date");
  });
};
