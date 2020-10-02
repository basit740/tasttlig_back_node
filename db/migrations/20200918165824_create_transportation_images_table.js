
exports.up = function(knex) {
  return knex.schema.createTable("transportation_images", table => {
    table.increments("transportation_image_id").unsigned().primary();
    table.integer("transportation_id").unsigned().index()
      .references("transportation_id").inTable("transportation");
    table.string("image_url").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("transportation_images");
};
