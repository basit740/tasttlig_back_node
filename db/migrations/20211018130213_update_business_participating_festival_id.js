exports.up = function (knex) {
    return knex.schema.alterTable("business_details", (table) => {
      table.specificType("business_festival_id", "INT[]");
      table.dropColumn("business_participating_festival_id");
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable("business_details", (table) => {
      table.dropColumn("business_festival_id");
      table.integer("business_participating_festival_id");
    });
  };
  