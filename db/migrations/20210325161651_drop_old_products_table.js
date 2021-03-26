
exports.up = function(knex) {
    return knex.schema.dropTable("products");
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("products");
  };

