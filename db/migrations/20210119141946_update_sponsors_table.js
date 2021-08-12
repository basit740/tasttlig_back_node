exports.up = function (knex) {
  return knex.schema.alterTable("sponsors", (table) => {
    table
      .integer("sponsor_business_id")
      .unsigned()
      .index()
      .references("business_details_id")
      .inTable("business_details");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("sponsors", (table) => {
    table.dropColumn("sponsor_business_id");
  });
};
