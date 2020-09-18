
exports.up = function(knex) {
  return knex.schema.createTable("venue_images", table => {
    table.increments("venue_image_id").unsigned().primary();
    table.integer("venue_id").unsigned().index()
      .references("venue_id").inTable("venue");
    table.string("image_url").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("venue_images");
};
