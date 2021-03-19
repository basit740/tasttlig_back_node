exports.up = function (knex) {
  return knex.schema.table("passport_images", (tableBuilder) => {
    tableBuilder.dropColumn("passport_image_id");
  });
};

exports.down = function (knex) {
  return knex.schema.table("passport_images", (tableBuilder) => {
    tableBuilder.integer("passport_image_id");
  });
};
