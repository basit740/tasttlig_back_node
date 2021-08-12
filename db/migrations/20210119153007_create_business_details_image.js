exports.up = function (knex) {
  return knex.schema.createTable("business_details_images", (table) => {
    table.increments("business_details_image_id").unsigned().primary();
    table
      .integer("business_details_id")
      .unsigned()
      .index()
      .references("business_details_id")
      .inTable("business_details");
    table.string("business_details_image_url");
    table.text("business_details_descirption");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("business_details_images");
};
