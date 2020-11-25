exports.up = function (knex) {
  return knex.schema.table("business_details", (table) => {
    table.renameColumn("phone_number", "business_phone_number");
  });
};

exports.down = function (knex) {
  return knex.schema.table("business_details", (table) => {
    table.dropColumn("phone_number");
  });
};
