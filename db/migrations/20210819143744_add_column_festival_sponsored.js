exports.up = function (knex) {
    return knex.schema.alterTable("festivals", (table) => {
      table.boolean("sponsored");

    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable("festivals", (table) => {
      table.boolean("sponsored");

    });
  };
  