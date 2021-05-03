exports.up = function(knex) {
    return knex.schema.alterTable("festivals", table => {
    
    table.specificType("festival_host_id", 'INT[]');
    // table.specificType("festival_vendor_id", 'INT[]');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("festivals", table => {
    
    table.dropColumn("festival_host_id");
    // table.dropColumn("festival_vendor_id");
  });
};