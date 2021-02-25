


exports.up = function(knex) {
    return knex("subscriptions").insert(
      [
        {
            subscription_code: "V_MIN",
            subscription_name: "Vendor_Minimum",
            price: "30",
            status: "ACTIVE",
            description: "Vendor Minimum Package",
            subscription_type: "package",
            comission_to_pay_percentage: "15",
            payment_receivable_per_food_sample: "2",
            can_sell_food_directly_to_guests: "TRUE",
            can_sell_food_experiences_to_guests: "TRUE",
            //festival_limit: '1'

        },{
            subscription_code: "V_MOD",
            subscription_name: "Vendor_Moderate",
            price: "100",
            status: "ACTIVE",
            description: "Vendor Moderate Package",
            subscription_type: "package",
            comission_to_pay_percentage: "10",
            payment_receivable_per_food_sample: "2",
            can_sell_food_directly_to_guests: "TRUE",
            can_sell_food_experiences_to_guests: "TRUE",
            //festival_limit: '2'
      },{
            subscription_code: "V_ULTRA",
            subscription_name: "Vendor_Ultra",
            price: "120",
            status: "ACTIVE",
            description: "Vendor Ultra Package",
            subscription_type: "package",
            comission_to_pay_percentage: "5",
            payment_receivable_per_food_sample: "2",
            can_sell_food_directly_to_guests: "TRUE",
            can_sell_food_experiences_to_guests: "TRUE",
            //fesitval_limit: '-1'
  }
      ]
    );
  };
  
  exports.down = function(knex) {
    const new_subscription_code = ['V_MIN', 'V_MOD', 'V_ULTRA'];
    return knex("subscriptions")
      .whereIn("subscription_code", new_subscription_code)
      .del();
      
      
  };
  
