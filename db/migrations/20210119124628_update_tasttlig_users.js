
exports.up = function(knex) {
    return knex.schema.alterTable("tasttlig_users", table => {
      
      table.renameColumn("country", "user_country");
      table.renameColumn("user_postal_code", "user_zip_postal_code");
      table.renameColumn("profile_image_link", "user_profile_image_link");
      table.string("user_logo_image_link");
      table.specificType("festival_id", 'INT[]');                        
      table.specificType("business_id", 'INT[]');        
      
      });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("tasttlig_users", table=>{
      table.dropColumn("country");
      table.dropColumn("user_postal_code");
      table.dropColumn("profile_image_link");
      table.dropColumn("user_logo_image_link");
      table.dropColumn("festival_id");                        
      table.dropColumn("business_id");    
    
    });
}
