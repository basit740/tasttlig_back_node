
exports.up = function (knex) {
    return knex.schema.table("carts", (table) => {
        table.dropColumn("status");
        table.dropColumn("created_at");
        table.dropColumn("updated_at");
      });
  };
  
  exports.down = function (knex) {
    return knex.schema.table("carts", (table) => {
        table.string("status").notNullable();
        table.string("created_at").notNullable();
        table.string("updated_at").notNullable();
      });
  };
  