exports.up = function(knex) {
  return knex.schema.createTable("sponsors", table => {
    table.increments("sponsor_id").unsigned().primary();
    table.integer("sponsor_user_id").unsigned().index()
      .references("tasttlig_user_id").inTable("tasttlig_users");
    table.string("sponsor_name");
    table.string("sponsor_address_1");
    table.string("sponsor_address_2");
    table.string("sponsor_city");
    table.string("sponsor_state");
    table.string("sponsor_postal_code");
    table.string("sponsor_country");
    table.text("sponsor_description");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("sponsors");
};
