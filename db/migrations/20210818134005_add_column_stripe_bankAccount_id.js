exports.up = function (knex) {
    return knex.schema.alterTable("stripe", (table) => {
      table.string("bank_account_id");

    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable("stripe", (table) => {
      table.dropColumn("bank_account_id");

    });
  };
  