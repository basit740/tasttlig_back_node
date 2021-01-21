exports.up = function (knex) {
  return knex.schema.table("business_details_images", (table) => {
    table.renameColumn(
      "business_details_descirption",
      "business_details_description"
    );
  });
};

exports.down = function (knex) {
  return knex.schema.table("business_details_images", (table) => {
    table.dropColumn("business_details_descirption");
  });
};
