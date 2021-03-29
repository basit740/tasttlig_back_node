exports.up = function(knex) {
    return knex.schema.alterTable("products", table => {
      table.integer("promotional_discount_id").unsigned().index()
      .references("promotion_id").inTable("promotions").onDelete("CASCADE");
      

    });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("products", table => {
        
        table.dropColumn("promotional_discount_id");
        
        
        
    });
  };