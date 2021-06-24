exports.up = function (knex) {
  return knex.schema.alterTable("services", (table) => {
    table.specificType("service_offering_type ", "VARCHAR[]");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("services", (table) => {
    table.dropColumn("service_offering_type");
  });
};
