exports.up = function(knex) {
    return knex.schema.createTable("passport_details", table => {
      
      
      table.increments("id").unsigned().primary();
      table.string("ticket_booking_id").unsigned().index()
      .references("ticket_booking_confirmation_id").inTable("ticket_details");
      table.string("passport__id").unsigned().index()
      .references("passport_id").inTable("tasttlig_users");
      table.integer("passport_user_id").unsigned().index()
      .references("tasttlig_user_id").inTable("tasttlig_users");
      table.integer("passport_festival_id").unsigned().index()
      .references("festival_id").inTable("festivals");
      table.integer("host_festival_id").unsigned().index()
      .references("host_id").inTable("hosts");      
      table.string("host_location");
      table.decimal("ticket_price");
      table.specificType("food_sample_cuisines_claimed", 'VARCHAR[]'); 
      table.specificType("food_sample_cuisines_redeemed", 'VARCHAR[]');      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("ticket_details");
  };
