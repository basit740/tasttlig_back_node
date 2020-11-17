
exports.up = function(knex) {
  return knex.schema.table("tasttlig_users", tableBuilder => {
    tableBuilder.string("source");
  })
};

exports.down = function(knex) {
  return knex.schema.table("tasttlig_users", tableBuilder => {
    tableBuilder.dropColumn("source");
  })
};
