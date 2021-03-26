
exports.up = function (knex) {
    return knex.schema.table("services", (table) => {
      table.dropColumn("service_festival_id");
      table.dropColumn("service_user_guest_id");
      
  
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table("services", (table) => {
      table.integer("service_festival_id");
      table.integer("service_user_guest_id");
      

    });
  };