

exports.up = function(knex) {
    return knex.schema.createTable("products", table => {
      table.increments("product_id").unsigned().primary();
      table.integer("product_business_id").unsigned().index()
        .references("business_details_id").inTable("business_details");
      table.string("product_name");
      table.integer("product_made_in_nationality_id");
      table.decimal("product_price");
      table.integer("product_quantity");
      table.string("product_size");
      table.date("product_expiry_date");
      table.datetime("product_expiry_time");
      table.text("product_description");
      table.string("product_code");
      table.integer("product_festival_id").unsigned().index()
      .references("festival_id").inTable("festivals");;
      table.string("product_status");
      table.datetime("product_created_at_datetime");
      table.datetime("product_updated_at_datetime");
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("products");
  };
  
