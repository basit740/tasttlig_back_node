exports.up = function(knex) {
  return knex.schema.table("business_details", table => {
    table.string("business_category");
  });
};

exports.down = function(knex) {
  return knex.schema.table("business_details", table => {
    table.dropColumn("business_category");
  });
};
