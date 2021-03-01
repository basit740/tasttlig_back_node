



exports.up = function(knex) {
  return knex("subscriptions").insert(
    [
      {
          subscription_code: "S_C1",
          subscription_name: "Sponsor_Cash_1.5K",
          price: "0",
          status: "ACTIVE",
          description: "Sponsoring Cash of 1500",
          subscription_type: "package",
          //products_services_sponsor_limit: "4"
          //festival_limit: '1'

      },
      {
          subscription_code: "S_C2",
          subscription_name: "Sponsor_Cash_5K",
          price: "0",
          status: "ACTIVE",
          description: "Sponsoring Cash of 5000",
          subscription_type: "package",
          //products_services_sponsor_limit: "4"
          //festival_limit: '1'

      },
      {
          subscription_code: "S_C3",
          subscription_name: "Sponsor_Cash_20K",
          price: "0",
          status: "ACTIVE",
          description: "Sponsoring Cash of 20000",
          subscription_type: "package",
          //products_services_sponsor_limit: "4"
          //festival_limit: '1'

      }
    ]
  );
};

exports.down = function(knex) {
  const new_subscription_code = ['S_C1', 'S_C2', 'S_C3'];
  return knex("subscriptions")
    .whereIn("subscription_code", new_subscription_code)
    .del();
    
    
};

