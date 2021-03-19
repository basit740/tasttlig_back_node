exports.up = function (knex) {
  return knex.schema.alterTable("business_details_images", (table) => {});
};

exports.down = function (knex) {
  return knex.schema.alterTable("business_details_images", (table) => {
    table.dropColumn("business_details_logo");
  });
};
