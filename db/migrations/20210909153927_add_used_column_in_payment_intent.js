exports.up = function (knex) {
  return knex.schema.alterTable("payments", (table) => {
    table.boolean("used").notNullable().defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("payments", (table) => {
    table.dropColumn("used");
  });
};
