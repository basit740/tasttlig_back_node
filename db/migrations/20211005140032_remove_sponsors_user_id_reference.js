exports.up = function (knex) {
    return knex.schema.alterTable("sponsors", (table) => {
        table.dropForeign('sponsor_user_id');
        table.dropForeign('sponsor_business_id')
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable("sponsors", (table) => {
      table.foreign('sponsor_user_id')
      .references("business_details_user_id")
      .inTable("business_details");
      table.foreign('sponsor_business_id')
      .references("business_details_id")
      .inTable("business_details");
  });
  };
  
