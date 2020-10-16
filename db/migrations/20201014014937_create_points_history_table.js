
exports.up = function(knex) {
  return knex.schema.createTable("points_history", table => {
    table.increments("point_id").unsigned().primary();
    table.integer("user_id").notNullable().index()
      .references('tasttlig_user_id').inTable('tasttlig_users');
    table.integer("points").notNullable();
    table.string("status").notNullable();
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("points_history");
};
