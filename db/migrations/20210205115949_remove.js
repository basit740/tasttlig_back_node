exports.up = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    table.renameColumn("bio_text", "business_details_description");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    table.dropColumn("bio_text");
  });
};
