exports.up = function (knex) {
  return knex.schema.table("experiences", (table) => {
    table
      .integer("nationality_id")
      .unsigned()
      .index()
      .references("id")
      .inTable("nationalities");
    table.specificType("coordinates", "geometry(point, 4326)");
    table.float("latitude");
    table.float("longitude");
  });
};

exports.down = function (knex) {
  return knex.schema.table("experiences", (table) => {
    table.dropColumn("nationality_id");
    table.dropColumn("coordinates");
    table.dropColumn("latitude");
    table.dropColumn("longitude");
  });
};
