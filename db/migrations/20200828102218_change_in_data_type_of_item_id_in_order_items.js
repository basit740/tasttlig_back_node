
exports.up = function(knex) {
  return knex.schema.alterTable("order_items", tableBuilder => {
    tableBuilder.string("item_id").alter();
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable("order_items", tableBuilder => {
    tableBuilder.integer("item_id").alter();
  })
};
