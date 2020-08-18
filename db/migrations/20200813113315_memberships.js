
exports.up = function(knex) {
  return knex.schema.createTable("memberships", table => {
    table.increments("membership_id").unsigned().primary();
    table.string("membership_name");
    table.decimal("validity_in_months");
    table.decimal("price");
    table.string("description", 1024);
    table.string("status");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("memberships");
};
