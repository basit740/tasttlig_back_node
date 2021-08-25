exports.up = function (knex) {
    return knex.schema.alterTable("festivals", (table) => {
      table.string("basic_passport_id");
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable("festivals", (table) => {
      table.dropColumn("basic_passport_id");
    });
  };
  