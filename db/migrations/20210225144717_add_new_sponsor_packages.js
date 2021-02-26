



exports.up = function(knex) {
    return knex("subscriptions").insert(
      [
        {
            subscription_code: "S_KMIN",
            subscription_name: "Sponsor_Kind_Min",
            price: "0",
            status: "ACTIVE",
            description: "Sponsoring Products Minimum Package",
            subscription_type: "package",
            //products_services_sponsor_limit: "4"
            //festival_limit: '1'

        },
        {
            subscription_code: "S_KMOD",
            subscription_name: "Sponsor_Kind_Moderate",
            price: "0",
            status: "ACTIVE",
            description: "Sponsoring Products Moderate Package",
            subscription_type: "package",
            //products_services_sponsor_limit: "4"
            //festival_limit: '1'

        },
        {
            subscription_code: "S_KULTRA",
            subscription_name: "Sponsor_Kind_Ultra",
            price: "0",
            status: "ACTIVE",
            description: "Sponsoring Products Ultra Package",
            subscription_type: "package",
            //products_services_sponsor_limit: "4"
            //festival_limit: '1'

        }
      ]
    );
  };
  
  exports.down = function(knex) {
    const new_subscription_code = ['S_KMIN','S_KMOD','S_KULTRA'];
    return knex("subscriptions")
      .whereIn("subscription_code", new_subscription_code)
      .del();
      
      
  };
  
