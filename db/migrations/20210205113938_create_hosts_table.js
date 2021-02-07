
exports.up = function(knex) {
    return knex.schema.createTable("hosts", table => {
      table.increments("host_id").unsigned().primary();
      table.integer("host_user_id").unsigned().index()
        .references("tasttlig_user_id").inTable("tasttlig_users");
      table.integer("host_business_id").unsigned().index()
        .references("business_details_user_id").inTable("business_details");
      table.text("host_description");
      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("hosts");
  };
  


