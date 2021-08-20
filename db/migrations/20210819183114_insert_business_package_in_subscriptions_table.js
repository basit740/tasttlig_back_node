exports.up = function (knex) {
    return knex("subscriptions").insert([
      {
        subscription_code: "B_MSHIP1",
        subscription_name: "Business_Membership_1",
        price: "50",
        description: "Business Membership Level 1",
        subscription_type: "package",
      }
    ]);
  };
  
  exports.down = function (knex) {
    const new_subscription_code = ["B_MSHIP1"];
    return knex("subscriptions")
      .whereIn("subscription_code", new_subscription_code)
      .del();
  };
  