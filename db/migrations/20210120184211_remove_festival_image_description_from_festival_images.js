exports.up = function (knex) {
  return knex.schema.table("festival_images", (table) => {
    table.dropColumn("festival_image_description");
  });
};

exports.down = function (knex) {
  return knex.schema.table("festival_images", (table) => {
    table.text("festival_image_description");
  });
};
