exports.up = function (knex) {
  return knex.schema.alterTable("services", (table) => {
    table.dropColumn("service_owner_type");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("services", (table) => {
    table.dropColumn("service_owner_type");
  });
};
