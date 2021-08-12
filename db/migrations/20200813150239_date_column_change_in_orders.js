exports.up = function (knex) {
  return knex.schema.table("orders", (tableBuilder) => {
    tableBuilder.dateTime("order_datetime");
    tableBuilder.dropColumn("start_datetime");
    tableBuilder.dropColumn("end_datetime");
  });
};

exports.down = function (knex) {
  return knex.schema.table("orders", (tableBuilder) => {
    tableBuilder.dropColumn("order_datetime");
    tableBuilder.dateTime("start_datetime");
    tableBuilder.dateTime("end_datetime");
  });
};
