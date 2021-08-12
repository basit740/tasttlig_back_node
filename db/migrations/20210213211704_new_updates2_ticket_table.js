exports.up = function (knex) {
  return knex.schema.alterTable("ticket_details", (table) => {
    table.decimal("ticket_price");
    table.renameColumn(
      "tikcet_booking_confirmation_id",
      "ticket_booking_confirmation_id"
    );
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("ticket_details", (table) => {
    table.dropColumn("ticket_price");
    table.dropColumn("tikcet_booking_confirmation_id");
  });
};
