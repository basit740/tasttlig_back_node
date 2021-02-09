
exports.up = function(knex) {
    return knex.schema.alterTable("products", table => {
      
      
      table.integer("product_independant_vendor_id").unsigned().index()
        .references("tasttlig_user_id").inTable("tasttlig_users");
      table.string("product_type");
      
      table.specificType("product_festivals_id", 'INT[]');
      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("products", table => {
        
        table.dropColumn("product_independant_vendor_id");
        table.dropColumn("product_type");
        
        table.dropColumn("product_festivals_id");
        
        
        
    });
  };

