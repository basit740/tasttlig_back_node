exports.up = function (knex) {
    return knex.schema.alterTable("passport_details", (table) => {
      table.string("passport_id");
      table.string("passport_type");
    });
  };
  exports.down = function (knex) {
    return knex.schema.alterTable("passport_details", (table) => {
      table.dropColumn("passport_id");
      table.string("passport_type");
    });
  };
  