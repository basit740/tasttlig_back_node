exports.up = function (knex) {
  return knex.schema.createTable("flagged_item_requests", (table) => {
    table.increments("flagged_item_request_id").unsigned().primary();
    table
      .integer("flagged_by_user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.string("flagged_item_type");
    table.integer("flagged_item_id");
    table.text("body");
    table.dateTime("start_datetime");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("flagged_item_requests");
};
