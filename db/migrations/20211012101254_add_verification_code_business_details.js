exports.up = function (knex) {
    return knex.schema.alterTable("business_details", (table) => {
      table.string("business_verification_code");
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable("business_details", (table) => {
      table.dropColumn("business_verification_code");
    });
  };
  
