exports.up = function (knex) {
  return knex.schema.createTable("vendors", (table) => {
    /* table.increments("vendor_id").unsigned().primary();
      table.integer("vendor_user_id").unsigned().index()
        .references("tasttlig_user_id").inTable("tasttlig_users");
      table.string("vendor_type");
      table.integer("vendor_business_id").unsigned().index()
        .references("business_details_id").inTable("business_details");
      table.text("vendor_description"); */
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("vendors");
};
