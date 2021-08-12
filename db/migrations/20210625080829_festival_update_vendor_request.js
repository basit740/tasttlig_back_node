exports.up = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.specificType("festival_host_admin_id", "INT[]");
    table.specificType("vendor_request_id", "INT[]");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.dropColumn("festival_host_admin_id");
    table.dropColumn("vendor_request_id");
  });
};
