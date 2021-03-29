exports.up = function (knex){
    return knex.schema.renameTable('all_products', 'products')
    
  };
    

exports.down = function (knex) {
    return knex.schema.renameTable('products', 'food_samples')
  };


  



