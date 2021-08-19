exports.up = function (knex) {
    return knex.schema.createTable("stripe", (table) => {
      table.increments("user_id").unsigned().primary();
      table.string("customer_id");
      table.string("card_id");
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("stripe");
  };
  