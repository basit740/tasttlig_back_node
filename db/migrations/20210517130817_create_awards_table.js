exports.up = function(knex) {
    return knex.schema.createTable("awards", table => {
    table.increments("award_id").unsigned().primary();
    table.string("award_title");
    table.text("award_description");
    table.dateTime("date_awarded");
    table.integer("business_id").unsigned().index()
    .references("business_details_id").inTable("business_details").onDelete("CASCADE");
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable("awards", table => {
   
  });
};