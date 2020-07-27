
exports.up = function(knex) {
  return knex.schema.createTable("experiences", table => {
    table.increments("experience_id").unsigned().primary();
    table.integer("experience_creator_user_id").unsigned().index()
      .references("tasttlig_user_id").inTable("tasttlig_users");
    table.string("title");
    table.decimal("price");
    table.string("category");
    table.string("style");
    table.dateTime("start_datetime");
    table.dateTime("end_datetime");
    table.integer("capacity");
    table.string("dress_code");
    table.text("description");
    table.string("status");
    table.string("address");
    table.string("city");
    table.string("state");
    table.string("country");
    table.string("postal_code");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("experiences");
};
