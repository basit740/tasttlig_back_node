exports.up = function (knex) {
  return knex.schema.alterTable("neighbourhood", (table) => {
    table.string("status");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("neighbourhood", (table) => {
    table.dropColumn("status");
  });
};
