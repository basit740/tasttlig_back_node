exports.up = function (knex) {
  return knex.schema.alterTable("services", (table) => {
    table.string("tax_included_or_not");
    table.string("shipping_included_or_not");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("services", (table) => {
    table.dropColumn("servictax_included_or_note_type");
    table.dropColumn("shipping_included_or_not");
  });
};
