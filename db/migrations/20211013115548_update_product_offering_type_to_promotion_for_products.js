exports.up = function (knex) {
    return knex.schema.table("products", (table) => {
      table.renameColumn(
        "product_offering_type",
        "promotion"
      );
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table("products", (table) => {
      table.dropColumn("product_offering_type");
    });
  };
  