exports.up = function(knex) {
  return knex.schema.createTable("experiences", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table
      .bigInteger("user_id")
      .unsigned()
      .index()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("title").notNullable();
    table.string("food_ethnicity").notNullable();
    table.string("img_url_1").notNullable();
    table.string("img_url_2").notNullable();
    table.string("img_url_3").notNullable();
    table.integer("capacity").notNullable();
    table.string("experience_type").notNullable();
    table.string("dress_code").notNullable();
    table.string("entertainment");
    table.string("start_time").notNullable();
    table.string("end_time").notNullable();
    table.string("date").notNullable();
    table.decimal("price").notNullable(); //TODO: change to decimal(12,2)
    table.string("postal_code").notNullable();
    table.string("address_line_1").notNullable();
    table.string("address_line_2");
    table.string("city").notNullable();
    table.string("province").notNullable();
    table.text("experience_information").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("experiences");
};
