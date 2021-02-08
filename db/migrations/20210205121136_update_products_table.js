
exports.up = function(knex) {
    return knex.schema.alterTable("products", table => {
      
      
<<<<<<< HEAD
      
=======
      table.integer("product_independant_vendor_id").unsigned().index()
        .references("tasttlig_user_id").inTable("tasttlig_users");
>>>>>>> a3d486d60f6f93d062189885d38e36c0dc299dec
      table.string("product_type");
      
      table.specificType("product_festivals_id", 'INT[]');
      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("products", table => {
        
<<<<<<< HEAD
        
=======
        table.dropColumn("product_independant_vendor_id");
>>>>>>> a3d486d60f6f93d062189885d38e36c0dc299dec
        table.dropColumn("product_type");
        
        table.dropColumn("product_festivals_id");
        
        
        
    });
  };

