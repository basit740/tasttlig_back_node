exports.up = function (knex) {
    return knex.schema.alterTable("business_details", (table) => {
      table.string("business_location");
    });
  };
  exports.down = function (knex) {
    return knex.schema.alterTable("business_details", (table) => {
      table.dropColumn("business_location");
    });
  };
  