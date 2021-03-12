
exports.up = function (knex) {
    return knex.schema.table("tasttlig_users", (table) => {
      table.dropColumn("business_name");
      table.dropColumn("business_type");
      table.dropColumn("business_id");
      table.dropColumn("festival_id");


      
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table("tasttlig_users", (table) => {
      table.string("business_name");
      table.string("business_type");
      table.specificType("business_id", 'INT[]');
      table.specificType("festival_id", 'INT[]');
      
    });
  };