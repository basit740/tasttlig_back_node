exports.up = function(knex) {
    return knex.schema.alterTable("product_images", table => {
      
      table.integer("product_id").unsigned().index()
      .references("product_id").inTable("products");
      
           

    });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("product_images", table => {
        
        table.dropColumn("product_id");
        ;
    });
  };