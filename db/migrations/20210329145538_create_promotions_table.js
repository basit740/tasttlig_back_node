exports.up = function(knex) {
    return knex.schema.createTable("promotions", table => {
    table.increments("promotion_id").unsigned().primary();
    table.integer("promotion_business_id").unsigned().index()
    .references("business_details_id").inTable("business_details").onDelete("CASCADE");
    table.string("promotion_name");
    table.text("promotion_description");
    table.integer("promotion_discount_percentage");
    table.double("promotion_discount_price"); 
    table.dateTime("promotion_start_date_time");
    table.dateTime("promotion_end_date_time");   
         
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable("promotions", table => {
   
  });
};