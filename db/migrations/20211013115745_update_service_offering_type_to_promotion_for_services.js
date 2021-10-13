exports.up = function (knex) {
    return knex.schema.table("services", (table) => {
      table.renameColumn(
        "service_offering_type",
        "promotion"
      );
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table("services", (table) => {
      table.dropColumn("service_offering_type");
    });
  };
  