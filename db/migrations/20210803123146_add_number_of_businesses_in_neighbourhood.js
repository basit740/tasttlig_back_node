exports.up = function(knex) {
  return knex.schema.table("neighbourhood", (table) => {
    table.integer("neighbourhood_number_of_businesses");
  });
};

exports.down = function(knex) {
  return knex.schema.table("neighbourhood", (table) => {
    table.dropColumn("neighbourhood_number_of_businesses");
  });
};
