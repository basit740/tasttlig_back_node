exports.up = function(knex) {
  return knex.schema.alterTable("tasttlig_users", table => {
    table.string("socialmedia_reference").defaultTo(null);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("tasttlig_users", table => {
      table.dropColumn("socialmedia_reference");
  });
};