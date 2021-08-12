exports.up = function (knex) {
  return knex.schema
    .createTable("subscriptions", (table) => {
      table.increments("subscription_id").unsigned().primary();
      table.string("subscription_code").unique();
      table.string("subscription_name");
      table.dateTime("date_of_expiry");
      table.decimal("validity_in_months");
      table.decimal("price");
      table.string("description");
      table.string("status");
    })
    .then(() => {
      return knex("subscriptions").insert([
        {
          subscription_code: "M_BP",
          subscription_name: "MEMBER_BASE_PASSPORT",
          date_of_expiry: new Date("2030-12-31 00:00:00"),
          validity_in_months: null,
          price: 0,
          description: "BASE PASSPORT FOR MEMBERS",
          status: "ACTIVE",
        },
        {
          subscription_code: "NM_FP_SEP_2020",
          subscription_name: "NON_MEMBER_FESTIVAL_PASSPORT_SEPTEMBER_2020",
          date_of_expiry: new Date("2020-09-31 00:00:00"),
          validity_in_months: null,
          price: 25,
          description:
            "NON MEMBER FESTIVAL PASSPORT VALID FOR SEPTEMBER 2020 FESTIVAL",
          status: "ACTIVE",
        },
        {
          subscription_code: "M_FP_SEP_2020",
          subscription_name: "MEMBER_FESTIVAL_PASSPORT_SEPTEMBER_2020",
          date_of_expiry: new Date("2020-09-31 00:00:00"),
          validity_in_months: null,
          price: 20,
          description:
            "MEMBER FESTIVAL PASSPORT VALID FOR SEPTEMBER 2020 FESTIVAL",
          status: "ACTIVE",
        },
        {
          subscription_code: "NM_FP_DEC_2020",
          subscription_name: "NON_MEMBER_FESTIVAL_PASSPORT_DECEMBER_2020",
          date_of_expiry: new Date("2020-12-31 00:00:00"),
          validity_in_months: null,
          price: 25,
          description:
            "NON MEMBER FESTIVAL PASSPORT VALID FOR DECEMBER 2020 FESTIVAL",
          status: "ACTIVE",
        },
        {
          subscription_code: "M_FP_DEC_2020",
          subscription_name: "MEMBER_FESTIVAL_PASSPORT_DECEMBER_2020",
          date_of_expiry: new Date("2020-12-31 00:00:00"),
          validity_in_months: null,
          price: 20,
          description:
            "MEMBER FESTIVAL PASSPORT VALID FOR DECEMBER 2020 FESTIVAL",
          status: "ACTIVE",
        },
      ]);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("subscriptions");
};
