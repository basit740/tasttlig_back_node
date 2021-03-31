exports.up = function(knex) {
    return knex.schema.alterTable("promotions", table => {
      table.renameColumn("promtion_name","promotion_name");
 
    });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("promotions", table => {
        
        table.renameColumn("promotion_name","promtion_name");
   
    });
  };