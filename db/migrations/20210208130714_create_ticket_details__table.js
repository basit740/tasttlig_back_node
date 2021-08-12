exports.up = function (knex) {
  return knex.schema.createTable("ticket_details", (table) => {
    table.increments("ticket_id").unsigned().primary();
    table.string("booking_confirmation_id");
    table
      .integer("ticket_user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table
      .integer("ticket_festival_id")
      .unsigned()
      .index()
      .references("festival_id")
      .inTable("festivals");
    table.integer("no_of_admits");
    table.string("stripe_receipt_id");
    table.boolean("attend_status");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("ticket_details");
};
