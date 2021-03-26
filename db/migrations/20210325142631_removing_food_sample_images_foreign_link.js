
exports.up = function (knex) {
    return knex.schema.table("food_sample_images", (table) => {
      table.dropColumn("food_sample_id");
      
  
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table("food_sample_images", (table) => {
      table.integer("food_sample_id");
      

    });
  };