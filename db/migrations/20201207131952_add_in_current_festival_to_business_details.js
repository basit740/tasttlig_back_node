
exports.up = function(knex) {
  return knex.schema.table("business_details", (table) => {
    table.boolean("in_current_festival");
  });
};

exports.down = function(knex) {
  return knex.schema.table("business_details", (table) => {
    table.dropColumn("in_current_festival");
  });
};
