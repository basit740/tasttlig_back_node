exports.up = function (knex) {
  return knex.schema.createTable("service_images", (table) => {
    table.increments("service_image_id").unsigned().primary();
    table
      .integer("service_id")
      .unsigned()
      .index()
      .references("service_id")
      .inTable("services");
    table.string("service_image_url");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("service_images");
};
