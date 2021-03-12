exports.up = function(knex) {
  return knex.schema.table("passport_images", tableBuilder => {
    
    
    
    tableBuilder.dropColumn("passport_id");
    
  });
};

exports.down = function(knex) {
  return knex.schema.table("passport_images", tableBuilder => {
      
      
      tableBuilder.integer("passport_id");
      
      
  });
};