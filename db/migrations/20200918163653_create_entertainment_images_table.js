exports.up = function (knex) {
  return knex.schema.createTable("entertainment_images", (table) => {
    table.increments("entertainment_image_id").unsigned().primary();
    table
      .integer("entertainment_id")
      .unsigned()
      .index()
      .references("entertainment_id")
      .inTable("entertainment");
    table.string("image_url").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("entertainment_images");
};
