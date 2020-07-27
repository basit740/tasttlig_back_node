
exports.up = function(knex) {
  return knex.schema.createTable("menus", table => {
    table.increments("menu_id").unsigned().primary();
    table.integer("owner_user_id").unsigned().index()
      .references("tasttlig_user_id").inTable("tasttlig_users");
    table.string("menu_name").notNullable();
    table.string("menu_type").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("menus");
};
