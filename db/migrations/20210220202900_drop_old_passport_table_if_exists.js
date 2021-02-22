
exports.up = function(knex) {
    return knex.schema.dropTableIfExists('passport');
  
};

exports.down = function(knex) {
  
};
