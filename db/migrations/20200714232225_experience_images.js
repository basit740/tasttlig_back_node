exports.up = function (knex) {
  return knex.schema.createTable("experience_images", (table) => {
    table.increments("experience_image_id").unsigned().primary();
    table
      .integer("experience_id")
      .unsigned()
      .index()
      .references("experience_id")
      .inTable("experiences");
    table.string("image_url").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("experience_images");
};
