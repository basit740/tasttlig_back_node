
exports.up = function(knex) {
    return knex.schema.createTable("festival_images", table => {
      table.increments("festival_image_id").unsigned().primary();
      table.integer("festival_id").unsigned().index().references("festival_id").inTable("festivals");
      table.string("festival_image_url");
      table.text("festival_image_descirption");
      
    });
};
  
  exports.down = function(knex) {
    return knex.schema.dropTable("festival_images");
  };
