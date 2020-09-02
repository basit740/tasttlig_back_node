
exports.up = function(knex) {
  return knex.schema.table("tasttlig_user_id", table => {
    table.unique('passport_id');
  })
};

exports.down = function(knex) {
  return knex.schema.table("tasttlig_user_id", table => {
    table.dropUnique('passport_id');
  })
};
