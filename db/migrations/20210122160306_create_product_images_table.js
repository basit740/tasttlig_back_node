exports.up = function(knex) {
    return knex.schema.createTable("product_images", table => {
      table.increments("product_image_id").unsigned().primary();
      table.integer("product_id").unsigned().index().references("product_id").inTable("products");
      table.string("product_image_url");
      
      
    });
};
  
  exports.down = function(knex) {
    return knex.schema.dropTable("product_images");
  };
