exports.up = function (knex){
    return knex.schema.renameTable('food_samples', 'all_products')
    
  };
    

exports.down = function (knex) {
    return knex.schema.renameTable('all_products', 'food_samples')
  };


  



