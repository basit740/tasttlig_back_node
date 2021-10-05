exports.up = function (knex) {
    return knex.schema.alterTable("business_details", (table) => {
      table.integer("business_user_id");
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable("business_details", (table) => {
      table.dropColumn("business_user_id");
    });
  };
  
