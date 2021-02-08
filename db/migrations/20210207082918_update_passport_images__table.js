
exports.up = function(knex) {
    return knex.schema.alterTable("passport_images", table => {
      
      
        table.string("passport_id").unsigned().index().references("passport_id").inTable("passport");
      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("passport_images", table =>{
     
        table.dropColumn("passport_id");
        
    }
    );
  };