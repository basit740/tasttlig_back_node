exports.up = function (knex) {
  return knex.schema.alterTable("ticket_details", (table) => {
    table.string("ticket_type");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("ticket_details", (table) => {
    table.string("ticket_type");
  });
};
