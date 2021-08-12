exports.up = function (knex) {
  return knex.schema.alterTable("experience_images", (table) => {
    table.renameColumn("image_url", "experience_image_url");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("experience_images", (table) => {
    table.dropColumn("image_url");
  });
};
