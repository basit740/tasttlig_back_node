exports.up = function (knex) {
  return knex.schema.table("services", (table) => {
    table.specificType("service_user_guest_id", "INT[]");
  });
};

exports.down = function (knex) {
  return knex.schema.table("services", (table) => {
    table.dropColumn("service_user_guest_id");
  });
};
