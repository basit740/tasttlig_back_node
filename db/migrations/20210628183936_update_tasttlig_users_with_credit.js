
exports.up = function(knex) {
  return knex.schema.alterTable("tasttlig_users", table => {
      table.real("credit")
  });
};

exports.down = function(knex) {
  
};
