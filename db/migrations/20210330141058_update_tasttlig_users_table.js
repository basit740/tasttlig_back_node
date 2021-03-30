exports.up = function(knex) {
    return knex.schema.alterTable("tasttlig_users", table => {
      table.boolean("is_influencer");
      table.text("ambassador_intent_description");
 
    });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("tasttlig_users", table => {
        
        table.dropColumn("is_influencer");
        table.dropColumn("ambassador_intent_description");
   
    });
  };