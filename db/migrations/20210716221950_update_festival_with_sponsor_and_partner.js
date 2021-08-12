exports.up = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.specificType("sponsor_request_id", "INT[]");
    table.specificType("partner_request_id", "INT[]");
    table.specificType("festival_business_partner_id", "INT[]");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.dropColumn("sponsor_request_id");
    table.dropColumn("partner_request_id");
    table.dropColumn("festival_business_partner_id");
  });
};
