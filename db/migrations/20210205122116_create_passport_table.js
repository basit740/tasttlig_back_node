

exports.up = function(knex) {
    return knex.schema.createTable("passport", table => {
      table.increments("id").unsigned().primary();
      table.integer("passport_id");
      table.integer("passport_user_id").unsigned().index()
        .references("tasttlig_user_id").inTable("tasttlig_users");
      table.integer("country_id").unsigned().index()
      .references("id").inTable("nationalities");;
      
      
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("passport");
  };
  



