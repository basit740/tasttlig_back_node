exports.up = function (knex) {
    return knex("subscriptions").insert([
      {
        subscription_code: "VEND",
        subscription_name: "Vend_Subscription",
        price: "30",
        status: "ACTIVE",
        description: "Vender Subscription",
        subscription_type: "package",
        validity_in_months: "1",
      },
    ]);
  };
  
  exports.down = function (knex) {
    const new_subscription_code = [
      "VEND",
    ];
    return knex("subscriptions")
      .whereIn("subscription_code", new_subscription_code)
      .del();
  };
  