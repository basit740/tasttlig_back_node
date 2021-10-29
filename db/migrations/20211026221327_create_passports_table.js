exports.up = function (knex) {
  return knex.schema.createTable("passports", (table) => {
    table.increments("id").unsigned().primary();
    table.string("name").notNullable();
    table.string("type");
    table.string("size");
    table.decimal("price");
    table.string("colour");
    table.dateTime("issue_date").notNullable();
    table.dateTime("expire_date").notNullable();
    table.string("season");
    table.specificType("features", "text ARRAY");
    table
      .integer("festival_id")
      .unsigned()
      .references("festival_id")
      .inTable("festivals");
    table
      .integer("user_id")
      .unsigned()
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("passports");
};
