
exports.up = async function(knex) {
    return knex.schema.alterTable("products", table => {
      table.double("discounted_price")
  });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("products", table => {
    table.dropColumn("discounted_price")
    })
  };
