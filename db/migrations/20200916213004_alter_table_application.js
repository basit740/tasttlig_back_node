
exports.up = function(knex) {
  return knex.schema.renameTable('hosting_application', 'applications')
};

exports.down = function(knex) {
  return knex.schema.renameTable('applications', 'hosting_application')
};
