
exports.up = function(knex) {
    return knex.schema.alterTable("products", table => {
<<<<<<< HEAD
      table.integer("product_independant_vendor_id").unsigned().index()
        .references("tasttlig_user_id").inTable("tasttlig_users");
=======
      
      
      
>>>>>>> 854f8bf28255d4d072659ff7e25448c708e692c7
      table.string("product_type");
      
      table.specificType("product_festivals_id", 'INT[]');
      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("products", table => {
<<<<<<< HEAD
        table.dropColumn("product_independant_vendor_id");
=======
        
        
>>>>>>> 854f8bf28255d4d072659ff7e25448c708e692c7
        table.dropColumn("product_type");
        table.dropColumn("product_festivals_id");    
        
    });
  };

