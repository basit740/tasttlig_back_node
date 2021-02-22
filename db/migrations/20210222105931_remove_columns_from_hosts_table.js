exports.up = function (knex) {
    return knex.schema.table("hosts", (table) => {
      table.dropColumn("cuisine_type");
      table.dropColumn("has_hosted_anything_before");
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table("hosts", (table) => {
      table.string("cuisine_type");
      table.boolean("has_hosted_anything_before");
    });
  };
  