exports.up = function (knex) {
  return knex.schema
    .table("subscriptions", () => {})
    .then(() => {
      return knex("subscriptions").insert([
        {
          subscription_code: "business-pro",
          subscription_name: "MEMBER_BUSINESS_PRO",
          date_of_expiry: null,
          validity_in_months: null,
          price: 5000,
          description: "MEMBER BUSINESS PRO",
          status: "ACTIVE",
          subscription_type: "PLAN",
        },
      ]);
    });
};

exports.down = function (knex) {
  return knex.schema.table("subscriptions", () => {});
};
