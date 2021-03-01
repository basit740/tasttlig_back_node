exports.up = function(knex) {
    return knex.schema.createTable("passport_images", table => {
      table.increments("passport_image_id").unsigned().primary();
      table.string("passport_id").unsigned().index()
      .references("passport_id").inTable("passport");
      table.string("passport_image_url");
      
      
    });
};
  
  exports.down = function(knex) {
    return knex.schema.dropTable("passport_images");
  };
