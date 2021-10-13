exports.up = function (knex) {
    return knex.schema.table("experiences", (table) => {
      table.renameColumn(
        "experience_offering_type",
        "promotion"
      );
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table("experiences", (table) => {
      table.dropColumn("experience_offering_type");
    });
  };
  