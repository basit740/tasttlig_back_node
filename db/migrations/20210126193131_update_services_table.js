exports.up = function (knex) {
  return knex.schema.table("services", (table) => {
    table.string("service_days");
    table.string("service_hours");
  });
};

exports.down = function (knex) {
  return knex.schema.table("services", (table) => {
    table.dropColumn("service_days");
    table.dropColumn("service_hours");
  });
};
