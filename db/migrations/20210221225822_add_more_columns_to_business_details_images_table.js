exports.up = function (knex) {
  return knex.schema.alterTable("business_details_images", (table) => {
    table.renameColumn("business_details_image_url", "business_details_logo");

    table.string("food_handling_certificate");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("business_details_images", (table) => {
    table.dropColumn("business_details_logo");

    table.dropColumn("food_handling_certificate");
  });
};
