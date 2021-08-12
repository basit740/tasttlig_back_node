exports.up = function (knex) {
  return knex("subscriptions").insert([
    {
      subscription_code: "H_VEND1",
      subscription_name: "Host_Vend_1",
      price: "300",
      status: "ACTIVE",
      description: "Host Vend Level 1",
      subscription_type: "package",
      comission_to_pay_percentage: "5",
      //   payment_receivable_per_food_sample: "0",
      can_sell_food_directly_to_guests: "TRUE",
      can_sell_food_experiences_to_guests: "FALSE",
      validity_in_months: "1",
    },
    {
      subscription_code: "H_VEND2",
      subscription_name: "Host_Vend_2",
      price: "200",
      status: "ACTIVE",
      description: "Host Vend Level 1",
      subscription_type: "package",
      comission_to_pay_percentage: "15",
      // payment_receivable_per_food_sample: "2",
      can_sell_food_directly_to_guests: "TRUE",
      can_sell_food_experiences_to_guests: "FALSE",
      validity_in_months: "1",
    },
    {
      subscription_code: "H_VEND3",
      subscription_name: "Host_Vend_3",
      price: "100",
      status: "ACTIVE",
      description: "Host Vend Level 1",
      subscription_type: "package",
      comission_to_pay_percentage: "20",
      // payment_receivable_per_food_sample: "2",
      can_sell_food_directly_to_guests: "TRUE",
      can_sell_food_experiences_to_guests: "FALSE",
      validity_in_months: "1",
    },
    {
      subscription_code: "G_MSHIP1",
      subscription_name: "Guest_Membership_1",
      price: "10",
      status: "ACTIVE",
      description: "Guest Membership level 1",
      subscription_type: "package",
      validity_in_months: "1",
      // comission_to_pay_percentage: "20",
      // payment_receivable_per_food_sample: "2",
      // can_sell_food_directly_to_guests: "TRUE",
      // can_sell_food_experiences_to_guests: "FALSE"
    },
    {
      subscription_code: "G_MSHIP2",
      subscription_name: "Guest_Membership_2",
      price: "20",
      status: "ACTIVE",
      description: "Guest Membership level 2",
      subscription_type: "package",
      validity_in_months: "1",
      // comission_to_pay_percentage: "20",
      // payment_receivable_per_food_sample: "2",
      // can_sell_food_directly_to_guests: "TRUE",
      // can_sell_food_experiences_to_guests: "FALSE"
    },
    {
      subscription_code: "G_MSHIP3",
      subscription_name: "Guest_Membership_3",
      price: "30",
      status: "ACTIVE",
      description: "Guest Membership level 3",
      subscription_type: "package",
      validity_in_months: "1",
      // comission_to_pay_percentage: "20",
      // payment_receivable_per_food_sample: "2",
      // can_sell_food_directly_to_guests: "TRUE",
      // can_sell_food_experiences_to_guests: "FALSE"
    },
  ]);
};

exports.down = function (knex) {
  const new_subscription_code = [
    "G_MSHIP1",
    "G_MSHIP2",
    "G_MSHIP3",
    "H_VEND3",
    "H_VEND2",
    "H_VEND1",
  ];
  return knex("subscriptions")
    .whereIn("subscription_code", new_subscription_code)
    .del();
};
