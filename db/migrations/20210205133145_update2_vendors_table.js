
exports.up = function(knex) {
    return knex.schema.table("vendors", tableBuilder => {
      
      
      tableBuilder.boolean("is_available_on_monday_for_festival");
      tableBuilder.boolean("is_available_on_tuesday_for_festival");
      tableBuilder.boolean("is_available_on_wednesday_for_festival");
      tableBuilder.boolean("is_available_on_thursday_for_festival");
      tableBuilder.boolean("is_available_on_friday_for_festival");
      tableBuilder.boolean("is_available_on_saturday_for_festival");
      tableBuilder.boolean("is_available_on_sunday_for_festival");
      
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.table("vendors", tableBuilder => {
      
        tableBuilder.dropColumn("is_available_on_monday_for_festival");
        tableBuilder.dropColumn("is_available_on_tuesday_for_festival");
        tableBuilder.dropColumn("is_available_on_wednesday_for_festival");
        tableBuilder.dropColumn("is_available_on_thursday_for_festival");
        tableBuilder.dropColumn("is_available_on_friday_for_festival");
        tableBuilder.dropColumn("is_available_on_saturday_for_festival");
        tableBuilder.dropColumn("is_available_on_sunday_for_festival");
    })
  };
  