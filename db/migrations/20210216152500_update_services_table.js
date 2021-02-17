exports.up = function(knex) {
    return knex.schema.alterTable("services", table => {
           
      
        table.string("service_creator_type");
        table.integer("service_user_id").unsigned().index()
        .references("tasttlig_user_id").inTable("tasttlig_users");
           
           
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("services", table => {
        
        
        table.dropColumn("service_creator_type");
        table.dropColumn("service_user_id");
         
        
    });
  };




  



