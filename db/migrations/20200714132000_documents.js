
exports.up = function(knex) {
  return knex.schema.createTable("documents", table => {
    table.increments("document_id").unsigned().primary();
    table.integer("user_id").unsigned().index()
      .references("tasttlig_user_id").inTable("tasttlig_users")
      .onDelete("CASCADE");
    table.string("document_type").notNullable();
    table.string("document_link").notNullable();
    table.dateTime("issue_date").notNullable();
    table.dateTime("expiry_date").notNullable();
    table.string("status").notNullable();
    table.string("feedback_text");
    table.string("feedback_by");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("documents");
};
