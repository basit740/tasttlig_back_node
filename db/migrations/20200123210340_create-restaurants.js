exports.up = function(knex) {
  return knex.schema.createTable("restaurants", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table
      .string("email")
      .unique()
      .notNullable();
    table
      .bigInteger("user_id")
      .unsigned()
      .index()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("postal_code").notNullable();
    table.string("address_line_1").notNullable();
    table.string("address_line_2").notNullable();
    table.string("city").notNullable();
    table.string("province").notNullable();
    table.text("description").notNullable();
    table.string("phone_number").notNullable();
    table.string("img_url");
    table.boolean("isValidated").defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("restaurants");
};
