exports.up = function (knex) {
  return knex("product_images").where("product_image_id", ">", 0).del();
};

exports.down = function (knex) {
  return knex.schema.table("product_image_id", () => {});
};
