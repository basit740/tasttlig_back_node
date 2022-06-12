exports.up = function (knex) {
    return knex.schema.alterTable("festivals", (table) => {
      table.boolean("is_active");
    });
  };
  exports.down = function (knex) {
    return knex.schema.alterTable("experiences", (table) => {
      table.dropColumn("is_active");
    });
  };
  