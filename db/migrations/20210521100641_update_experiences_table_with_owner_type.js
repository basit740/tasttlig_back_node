exports.up = function(knex) {
  return knex.schema.alterTable("experiences", table => {
    table.string("experience_owner_type");
  });
};
exports.down = function(knex) {
  return knex.schema.alterTable("experiences", table => {
      table.dropColumn("experience_owner_type");
  });
};