
exports.up = function(knex) {
    return knex.schema.createTable("services", table => {
      table.increments("service_id").unsigned().primary();
      table.integer("service_business_id").unsigned().index()
        .references("business_details_id").inTable("business_details");
      table.string("service_name");
      table.integer("service_nationality_id");
      table.decimal("service_price");
      table.integer("service_capacity");
      table.string("service_size_scope");
      table.text("service_description");
      table.string("service_code");
      table.integer("service_festival_id").unsigned().index()
      .references("festival_id").inTable("festivals");;
      table.string("service_status");
      table.datetime("service_created_at_datetime");
      table.datetime("service_updated_at_datetime");
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("services");
  };
  

