


exports.up = function(knex) {
    return knex("subscriptions").insert(
      [
        {
          subscription_code: "H_RED",
          subscription_name: "Host_Package_Red",
          price: "0",
          status: "ACTIVE",
          description: "Host_Package_Red",
          subscription_type: "package",
          comission_to_pay_percentage: "0",
          payment_receivable_per_food_sample: "2",
          can_sell_food_directly_to_guests: "FALSE",
          can_sell_food_experiences_to_guests: "FALSE"

        },{
            subscription_code: "H_BLUE",
            subscription_name: "Host_Package_Blue",
            price: "50",
            status: "ACTIVE",
            description: "Host_Package_Blue",
            subscription_type: "package",
            comission_to_pay_percentage: "0",
            payment_receivable_per_food_sample: "2",
            can_sell_food_directly_to_guests: "TRUE",
            can_sell_food_experiences_to_guests: "FALSE"
      },{
            subscription_code: "H_BLACK",
            subscription_name: "Host_Package_Black",
            price: "100",
            status: "ACTIVE",
            description: "Host_Package_Black",
            subscription_type: "package",
            comission_to_pay_percentage: "0",
            payment_receivable_per_food_sample: "2",
            can_sell_food_directly_to_guests: "TRUE",
            can_sell_food_experiences_to_guests: "TRUE"
  }
      ]
    );
  };
  
  exports.down = function(knex) {
    const new_subscription_code = ['H_RED', 'H_BLUE', 'H_BLACK'];
    return knex("subscriptions")
      .whereIn("subscription_code", new_subscription_code)
      .del();
      
      
  };
  
