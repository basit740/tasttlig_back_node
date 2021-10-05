exports.up = function (knex) {
    return knex.schema.alterTable("tasttlig_users", (table) => {
      table.specificType("user_claimed_business", "INT[]");
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable("tasttlig_users", (table) => {
      table.dropColumn("user_claimed_business");
    });
  };
  