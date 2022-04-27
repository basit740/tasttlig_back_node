exports.up = function (knex) {
  return knex.schema.alterTable("orders", (table) => {
    table.string("intent_id")
    table.string("email")
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("orders", (table) => {
    table.dropColumn("intent_id");
    table.dropColumn("email");
  });
};
