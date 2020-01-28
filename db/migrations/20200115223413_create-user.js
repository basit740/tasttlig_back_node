exports.up = function(knex) {
  return knex.schema.createTable("users", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table
      .string("email")
      .unique()
      .notNullable();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("phone_number").notNullable();
    table.string("img_url");
    table.string("food_handler_certificate").defaultTo(false);
    table.string("password").notNullable();
    table.string("role").defaultTo("user");
    table.string("verified").defaultTo(false);
    table
      .boolean("isHost")
      .notNullable()
      .defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("users");
};
