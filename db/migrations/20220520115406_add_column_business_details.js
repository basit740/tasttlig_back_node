exports.up = function (knex) {
    return knex.schema.alterTable("business_details", (table) => {
        table
        .integer("neighbourhood_id")
        .references("neighbourhood_id")
        .inTable("neighbourhood");
    });
  };
  exports.down = function (knex) {
    return knex.schema.alterTable("business_details", (table) => {
      table.dropColumn("neighbourhood_id");
    });
  };
  