exports.up = function (knex) {
  return knex.schema.createTable("dummy_table_2", (table) => {
    table.increments("festival_image_id").unsigned().primary();
    table.integer("festival_id");
    table.string("festival_image_url");
    table.text("festival_image_descirption");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("dummy_table_2");
};
