
exports.up = function(knex) {
    return knex.schema.alterTable("ticket_details", table => {
           
      
        table.integer("host_id").unsigned().index()
        .references("host_id").inTable("hosts");
        table.integer("host_business_id").unsigned().index()
        .references("business_details_id").inTable("business_details");
        table.integer("food_samples_claimed");
        table.integer("food_samples_redeemed");
        table.specificType("food_sample_cusines_claimed", 'VARCHAR[]');
        table.specificType("food_sample_cusines_redeemed", 'VARCHAR[]');
           
           
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("ticket_details", table => {
        
        
        table.dropColumn("host_id");
        table.dropColumn("host_business_id");
        table.dropColumn("food_samples_claimed");
        table.dropColumn("food_samples_redeemed");
        table.dropColumn("food_sample_cusines_claimed");
        table.dropColumn("food_sample_cusines_redeemed");
        
         
        
    });
  };




  




