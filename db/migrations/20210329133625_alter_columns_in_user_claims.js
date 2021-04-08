exports.up = function(knex) {
      return knex.schema.createTable("user_claims", table => {
      table.increments("claim_id").unsigned().primary();
      table.integer("claim_user_id").unsigned().index()
      .references("tasttlig_user_id").inTable("tasttlig_users");
      table.string("user_claim_email");
      table.integer("claimed_product_id").unsigned().index()
      .references("product_id").inTable("products").onDelete("CASCADE");
      table.integer("claimed_service_id").unsigned().index()
      .references("service_id").inTable("services").onDelete("CASCADE");
      table.integer("claimed_experience_id").unsigned().index()
      .references("experience_id").inTable("experiences").onDelete("CASCADE");
      table.integer("festival_id").unsigned().index()
      .references("festival_id").inTable("festivals").onDelete("CASCADE");
      table.string("current_stamp_status");
      table.string("stamp_status");
      table.string("claimed_quantity");
      table.string("festival_name");
      table.dateTime("reserved_on");
      table.dateTime("user_stamp_date_time");
      table.string("claim_viewable_id");
      
           
    });
  };
  exports.down = function(knex) {
    return knex.schema.dropTable("user_claims", table => {
        
        
    });
  };