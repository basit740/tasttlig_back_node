exports.up = function (knex) {
  return knex.schema.createTable("business_services", (table) => {
    table.increments("business_service_id").unsigned().primary();
    table
      .integer("user_id")
      .notNullable()
      .index()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.string("name");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("business_services");
};
