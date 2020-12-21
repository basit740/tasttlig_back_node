exports.up = function(knex) {
  return knex.schema.table("tasttlig_users", tableBuilder => {
    tableBuilder.dropColumn("referrer_source");
  })
};

exports.down = function(knex) {
  return knex.schema.table("tasttlig_users", tableBuilder => {
    tableBuilder.string("referrer_source");
  })
};
