exports.up = function (knex) {
  return knex.schema
    .table("subscriptions", () => {})
    .then(() => {
      return knex("subscriptions").insert([
        {
          subscription_code: "business-basic",
          subscription_name: "MEMBER_BUSINESS_BASIC",
          date_of_expiry: null,
          validity_in_months: null,
          price: 360,
          description: "MEMBER BUSINESS BASIC",
          status: "ACTIVE",
          subscription_type: "PLAN",
        },
        {
          subscription_code: "business-intermediate",
          subscription_name: "MEMBER_BUSINESS_INTERMEDIATE",
          date_of_expiry: null,
          validity_in_months: null,
          price: 2499,
          description: "MEMBER BUSINESS INTERMEDIATE",
          status: "ACTIVE",
          subscription_type: "PLAN",
        },
        {
          subscription_code: "business-advanced",
          subscription_name: "MEMBER_BUSINESS_ADVANCED",
          date_of_expiry: null,
          validity_in_months: null,
          price: 2999,
          description: "MEMBER BUSINESS ADVANCED",
          status: "ACTIVE",
          subscription_type: "PLAN",
        },
      ]);
    });
};

exports.down = function (knex) {
  return knex.schema.table("subscriptions", () => {});
};
