exports.up = function (knex) {
  return knex.schema.createTable("food_samples", (table) => {
    table.increments("food_sample_id").unsigned().primary();
    table
      .integer("food_sample_creater_user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.string("title");
    table.date("start_date");
    table.time("start_time");
    table.date("end_date");
    table.time("end_time");
    table.string("status");
    table.string("address");
    table.string("city");
    table.string("state");
    table.string("postal_code");
    table.string("country");
    table.text("description");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("food_samples");
};
