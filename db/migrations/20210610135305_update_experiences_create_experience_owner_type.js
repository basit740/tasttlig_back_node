exports.up = function (knex) {
  return knex.schema.alterTable("experiences", (table) => {
    table.specificType("experience_offering_type ", "VARCHAR[]");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("experiences", (table) => {
    table.dropColumn("experience_offering_type");
  });
};
