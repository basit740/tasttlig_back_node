
exports.up = function(knex) {
  return knex.schema.createTable("food_sample_images", table => {
    table.increments("food_sample_image_id").unsigned().primary();
    table.integer("food_sample_id").unsigned().index()
      .references("food_sample_id").inTable("food_samples");
    table.string("image_url").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("food_sample_images");
};
