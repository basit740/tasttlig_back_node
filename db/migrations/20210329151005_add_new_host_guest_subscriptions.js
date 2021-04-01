



exports.up = function(knex) {
    return knex("subscriptions").insert(
      [
        {
            subscription_code: "H_BASIC",
            subscription_name: "Host_Basic",
            price: "0",
            status: "ACTIVE",
            description: "Basic Host Package",
            subscription_type: "package",
           
        },
        {
            subscription_code: "H_VEND",
            subscription_name: "Host_Vending",
            price: "200",
            status: "ACTIVE",
            description: "Vending Host Package",
            subscription_type: "package",
            
        },
        {
            subscription_code: "H_AMB",
            subscription_name: "Host_Ambassador",
            price: "300",
            status: "ACTIVE",
            description: "Host Ambassador Package",
            subscription_type: "package",
            
        },
        {
            subscription_code: "G_BASIC",
            subscription_name: "Guest_Basic",
            price: "0",
            status: "ACTIVE",
            description: "Basic Guest Package",
            subscription_type: "package",
        },
        {
            subscription_code: "G_MSHIP",
            subscription_name: "Guest_Membership",
            price: "30",
            status: "ACTIVE",
            description: "Guest Membership Package",
            subscription_type: "package",
        },
        {
            subscription_code: "G_AMB",
            subscription_name: "Guest_Ambassador",
            price: "0",
            status: "ACTIVE",
            description: "Guest Ambassador Package",
            subscription_type: "package",
        }
      ]
    );
  };
  
  exports.down = function(knex) {
    const new_subscription_code = ['H_BASIC','H_VEND','H_AMB','G_BASIC','G_MSHIP','G_AMB'];
    return knex("subscriptions")
      .whereIn("subscription_code", new_subscription_code)
      .del();
      
      
  };
  
