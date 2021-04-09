exports.up = function(knex) {
    return knex.schema.alterTable("tasttlig_users", table => {
    
    table.dateTime("email_verified_date_time");
    table.dateTime("passport_expiry_date");
    
         
  });
};
exports.down = function(knex) {
  return knex.schema.alterTable("tasttlig_users", table => {
      table.dropColumn("email_verified_date_time")
      table.dropColumn("passport_expiry_date")

      
  });
};