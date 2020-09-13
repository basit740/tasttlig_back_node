exports.up = function (knex) {
  return knex.schema
    .table("subscriptions", () => {})
    .then(() => {
      return knex("subscriptions").insert([
        {
          subscription_code: "M_F_SEP_2020_S",
          subscription_name: "MEMBER_FESTIVAL_SEPTEMBER_2020_SINGLE",
          date_of_expiry: new Date("2020-09-31 00:00:00"),
          validity_in_months: null,
          price: 20,
          description: "MEMBER SEPTEMBER 2020 FESTIVAL PASS FOR SINGLE RESERVE",
          status: "ACTIVE",
          subscription_type: "FESTIVAL",
        },
        {
          subscription_code: "M_F_SEP_2020_M",
          subscription_name: "MEMBER_FESTIVAL_SEPTEMBER_2020_MULTIPLE",
          date_of_expiry: new Date("2020-09-31 00:00:00"),
          validity_in_months: null,
          price: 40,
          description: "MEMBER SEPTEMBER 2020 FESTIVAL PASS FOR MULTIPLE RESERVE",
          status: "ACTIVE",
          subscription_type: "FESTIVAL",
        },
      ]);
    });
};

exports.down = function (knex) {
  return knex.schema.table("subscriptions", () => {});
};
