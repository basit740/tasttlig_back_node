exports.up = function(knex) {
    return knex.schema.alterTable("promotions", table => {
      table.string("promtion_status");
 
    });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("promotions", table => {
        
        table.dropColumn("promotion_status");
   
    });
  };