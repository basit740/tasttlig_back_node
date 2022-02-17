exports.up = function (knex) {
    return knex.schema.alterTable("festivals", (table) => {
      table.boolean("festival_landing_page_featured").defaultTo(false);
    });
  };
  exports.down = function (knex) {
    return knex.schema.alterTable("festivals", (table) => {
      table.dropColumn("festival_landing_page_featured");
    });
  };
  