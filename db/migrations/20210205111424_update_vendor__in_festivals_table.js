exports.up = function(knex) {
    return knex.schema.table("festivals", tableBuilder => {
      tableBuilder.dropColumn("festival_restaurant_host_id");
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.table("festivals", tableBuilder => {
        table.specificType("festival_restaurant_host_id", 'INT[]');
    })
  };