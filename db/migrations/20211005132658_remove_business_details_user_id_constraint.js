exports.up = function (knex) {
    return knex.schema.alterTable("hosts", (table) => {
        table.dropForeign('host_user_id');
        table.dropForeign('host_business_id');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable("hosts", (table) => {
        table.foreign('host_user_id')
        .references("business_details_user_id")
        .inTable("business_details");
        table.foreign('host_business_id')
        .references("business_details_id")
        .inTable("business_details");
    });
  };
  
