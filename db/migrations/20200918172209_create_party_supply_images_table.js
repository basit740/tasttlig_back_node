exports.up = function (knex) {
  return knex.schema.createTable("party_supply_images", (table) => {
    table.increments("party_supply_image_id").unsigned().primary();
    table
      .integer("party_supply_id")
      .unsigned()
      .index()
      .references("party_supply_id")
      .inTable("party_supply");
    table.string("image_url").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("party_supply_images");
};
