exports.up = function (knex) {
  return knex.schema.table("payment_info", (table) => {
    table.string("paypal_email");
    table.string("stripe_account_number");
    table.string("etransfer_email");
    table.string("payment_type");
  });
};

exports.down = function (knex) {
  return knex.schema.table("payment_info", (table) => {
    table.dropColumn("paypal_email");
    table.dropColumn("stripe_account_number");
    table.dropColumn("etransfer_email");
    table.dropColumn("payment_type");
  });
};
