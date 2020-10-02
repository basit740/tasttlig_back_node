exports.up = knex => {
  return knex.schema.alterTable('venue', (table) => {
    table.text('description').alter();
  });
};

exports.down = knex => {
  return knex.schema.alterTable('venue', table => {
    table.string('description').alter();
  });
};
