exports.up = function (knex) {
  const assetsCreate = knex.schema.createTable("assets", (table) => {
    table.increments("asset_id").unsigned().primary();
    table
      .integer("user_id")
      .notNullable()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.string("name");
    table.text("description");
  });
  const assetImagesCreate = knex.schema.createTable("asset_images", (table) => {
    table.increments("asset_image_id").unsigned().primary();
    table
      .integer("asset_id")
      .notNullable()
      .index()
      .references("asset_id")
      .inTable("assets");
    table.string("image_url");
  });
  return Promise.all([assetsCreate, assetImagesCreate]);
};

exports.down = function (knex) {
  const assetsDrop = knex.schema.dropTable("assets");
  const assetImagesDrop = knex.schema.dropTable("asset_images");
  return Promise.all([assetsDrop, assetImagesDrop]);
};
