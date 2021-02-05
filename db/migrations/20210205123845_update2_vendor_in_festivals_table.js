exports.up = function(knex) {
    return knex.schema.alterTable("festivals", table => {
      
      
      table.integer("festival_vendor_id").unsigned().index()
        .references("vendor_id").inTable("vendors");
      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("festivals", table => {
        
        table.dropColumn("festival_vendor_id");
        
        
        
    });
  };