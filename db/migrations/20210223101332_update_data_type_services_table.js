exports.up = function (knex) {
  return knex.schema.table("services", (table) => {
    table.dropColumn("service_festival_id");
  });
};

exports.down = function (knex) {
  return knex.schema.table("hosts", (table) => {
    table.integer("service_festival_id");
  });
};
