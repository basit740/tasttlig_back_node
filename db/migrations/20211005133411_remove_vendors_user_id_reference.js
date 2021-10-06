exports.up = function (knex) {
    return knex.schema.alterTable("vendors", (table) => {
        table.dropForeign('vendor_user_id');
        table.dropForeign('vendor_business_id');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable("vendors", (table) => {
      table.foreign('vendor_user_id')
      .references("business_details_user_id")
      .inTable("business_details");
      table.foreign('vendor_business_id')
      .references("business_details_id")
      .inTable("business_details");
  });
  };
  
