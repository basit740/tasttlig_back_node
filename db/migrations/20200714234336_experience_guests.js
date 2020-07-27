
exports.up = function(knex) {
  return knex.schema.createTable("experience_guests", table => {
    table.increments("experience_guest_id").unsigned().primary();
    table.integer("experience_id").unsigned().index()
      .references("experience_id").inTable("experiences");
    table.integer("guest_user_id").unsigned().index()
      .references("tasttlig_user_id").inTable("tasttlig_users");
    table.string("status").notNullable();
    table.dateTime("created_at_datetime").notNullable();
    table.dateTime("updated_at_datetime").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("experience_guests");
};
