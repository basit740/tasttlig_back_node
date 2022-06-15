exports.up = function (knex) {
    return knex.schema.alterTable("festivals", (table) => {
      table.boolean("is_active").defaultTo(true);
    });
  };
  exports.down = function (knex) {
    return knex.schema.alterTable("festivals", (table) => {
      table.dropColumn("is_active");
    });
  };
  