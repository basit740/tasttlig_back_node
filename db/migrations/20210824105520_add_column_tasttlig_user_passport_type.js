exports.up = function (knex) {
    return knex.schema.alterTable("tasttlig_users", (table) => {
      table.string("passport_type");
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable("tasttlig_users", (table) => {
      table.dropColumn("passport_type");
    });
  };
  