
exports.up = function(knex) {
    return knex.schema.dropTable("passport_details");
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("passport_details");
  };

