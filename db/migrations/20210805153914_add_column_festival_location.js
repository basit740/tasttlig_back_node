exports.up = function(knex) {
    return knex.schema.alterTable("festivals", table => {
      

      table.string("festival_postal_code");
      table.string("festival_province");
      table.string("festival_country");
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable("festivals", table => {
        

        table.dropColumn("festival_postal_code");
        table.dropColumn("festival_province");
        table.dropColumn("festival_country");
    });
  };
  