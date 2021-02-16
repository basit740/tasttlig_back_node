
exports.up = function(knex) {
    return knex.schema.alterTable("products", table => {
<<<<<<< HEAD
      table.integer("product_independant_vendor_id").unsigned().index()
        .references("tasttlig_user_id").inTable("tasttlig_users");
=======
      
      
      
>>>>>>> a9a0c32aacc8dfe0e07d3c8d4ab8f1aa671c7b60
      table.string("product_type");
      
      table.specificType("product_festivals_id", 'INT[]');
      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("products", table => {
<<<<<<< HEAD
        table.dropColumn("product_independant_vendor_id");
=======
        
        
>>>>>>> a9a0c32aacc8dfe0e07d3c8d4ab8f1aa671c7b60
        table.dropColumn("product_type");
        table.dropColumn("product_festivals_id");    
        
    });
  };

