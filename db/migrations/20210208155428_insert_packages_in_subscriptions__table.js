

exports.up = function(knex) {
    return knex("subscriptions").insert(
      [
        {
          subscription_code: "F_SB",
          subscription_name: "festival_sponsorship_basic",
          price: "100",
          description: "festival_sponsorship_basic_package",
          subscription_type: "package"

        },{
            subscription_code: "V_SB",
            subscription_name: "vendor_basic",
            price: "300",
            description: "festival_vendor_basic_package",
            subscription_type: "package"
      },{
        subscription_code: "G_FB",
        subscription_name: "guest_festival_booking",
        price: "250",
        description: "guest_festival_booking_price",
        subscription_type: "package" 
      }
      ]
    );
  };
  
  exports.down = function(knex) {
    const new_subscription_code = ['F_SB', 'V_SB', 'G_FB'];
    return knex("subscriptions")
      .whereIn("subscription_code", new_subscription_code)
      .del();
      
      
  };
  
