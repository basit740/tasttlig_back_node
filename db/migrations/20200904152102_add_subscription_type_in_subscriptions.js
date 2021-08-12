exports.up = function (knex) {
  return knex.schema
    .table("subscriptions", (tableBuilder) => {
      tableBuilder.string("subscription_type");
    })
    .then(() => {
      return knex("subscriptions").insert([
        {
          subscription_code: "F_SEP_2020_S",
          subscription_name: "FESTIVAL_SEPTEMBER_2020_SINGLE",
          date_of_expiry: new Date("2020-09-31 00:00:00"),
          validity_in_months: null,
          price: 25,
          description: "SEPTEMBER 2020 FESTIVAL PASS FOR SINGLE RESERVE",
          status: "ACTIVE",
          subscription_type: "FESTIVAL",
        },
        {
          subscription_code: "F_SEP_2020_M",
          subscription_name: "FESTIVAL_SEPTEMBER_2020_MULTIPLE",
          date_of_expiry: new Date("2020-09-31 00:00:00"),
          validity_in_months: null,
          price: 50,
          description: "SEPTEMBER 2020 FESTIVAL PASS FOR MULTIPLE RESERVE",
          status: "ACTIVE",
          subscription_type: "FESTIVAL",
        },
      ]);
    });
};

exports.down = function (knex) {
  return knex.schema.table("subscriptions", (tableBuilder) => {
    tableBuilder.dropColumn("subscription_type");
  });
};
