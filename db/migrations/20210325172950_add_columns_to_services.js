exports.up = function (knex) {
  return knex.schema.alterTable("services", (table) => {
    table.string("service_type");
    table.date("start_date");
    table.date("end_date");
    table.time("start_time");
    table.time("end_time");
    table.specificType("experiences_selected", "INT[]");
    table.specificType("products_selected", "INT[]");
    table.specificType("festivals_selected", "INT[]");
    table.text("additional_information");
    table.specificType("service_days", "VARCHAR[]").alter();
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("services", (table) => {
    table.dropColumn("service_type");
    table.dropColumn("start_date");
    table.dropColumn("end_date");
    table.dropColumn("start_time");
    table.dropColumn("end_time");
    table.dropColumn("experiences_selected");
    table.dropColumn("products_selected");
    table.dropColumn("festivals_selected");
    table.dropColumn("additional_information");
  });
};
