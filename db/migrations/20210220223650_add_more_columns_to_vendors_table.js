
exports.up = function(knex) {
    return knex.schema.alterTable("vendors", table => {
           
      
        table.specificType("cooking_area", 'VARCHAR[]');
        table.text("food_temperature_maintenance_plan");
        table.specificType("equipment_required", 'VARCHAR[]');
        table.text("other_info");
           
           
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("vendors", table => {
        
        
        table.dropColumn("cooking_area");
        table.dropColumn("food_temperature_maintenance_plan");
        table.dropColumn("equipment_required");
        table.dropColumn("other_info");
              
         
        
    });
  };




  




