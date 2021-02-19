exports.up = function(knex) {
    return knex.schema.table("passport", tableBuilder => {
        tableBuilder.dropColumn("preferred_country_cuisine");
        
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.table("passport", tableBuilder => {
      tableBuilder.string("preferred_country_cuisine");
      
    })
  };
