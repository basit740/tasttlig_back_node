exports.up = function (knex) {
  return knex.schema.createTable("business_details", (table) => {
    table.increments("business_id").unsigned().primary();
    table
      .integer("user_id")
      .unsigned()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.string("address");
    table.string("city");
    table.string("state");
    table.string("country");
    table.string("postal_code");
    table.string("phone_number");
    table.string("logo_link");
    table.string("bio_text");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("business_details");
};
