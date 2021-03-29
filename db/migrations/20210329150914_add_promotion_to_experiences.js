exports.up = function(knex) {
    return knex.schema.alterTable("experiences", table => {
      table.integer("promotional_discount_id").unsigned().index()
      .references("promotion_id").inTable("promotions").onDelete("CASCADE");
      

    });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("experiences", table => {
        
        table.dropColumn("promotional_discount_id");
        
        
        
    });
  };