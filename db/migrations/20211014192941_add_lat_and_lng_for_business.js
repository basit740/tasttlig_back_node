exports.up = function (knex) {
  return knex.schema.table("business_details", (table) => {
    table.float("latitude");
    table.float("longitude");
  });
};

exports.down = function (knex) {
  return knex.schema.table("business_details", (table) => {
    table.dropColumn("latitude");
    table.dropColumn("longitude");
  });
};
