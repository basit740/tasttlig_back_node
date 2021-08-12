exports.up = function (knex) {
  return knex("subscriptions").insert([
    {
      subscription_code: "H_FB",
      subscription_name: "host_festival_basic",
      price: "50",
      description: "host_basic_plan",
      subscription_type: "PLAN",
      comission_to_pay_percentage: "0",
    },
    {
      subscription_code: "H_FCB",
      subscription_name: "host_festival_commision_based",
      price: "0",
      description: "host_festival_commision_based_plan",
      subscription_type: "PLAN",
      comission_to_pay_percentage: "25",
    },
  ]);
};

exports.down = function (knex) {
  const new_subscription_code = ["H_FB", "H_FCB"];
  return knex("subscriptions")
    .whereIn("subscription_code", new_subscription_code)
    .del();
};
