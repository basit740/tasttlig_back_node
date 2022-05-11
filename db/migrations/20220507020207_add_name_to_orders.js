exports.up = function (knex) {
  return knex.schema.alterTable("orders", (table) => {
    table.string("name")
    table.renameColumn("intent_id", "reference_id")
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("orders", (table) => {
    table.dropColumn("name");
    table.renameColumn("reference_id", "intent_id")
  });
};
