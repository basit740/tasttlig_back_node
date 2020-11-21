exports.up = function (knex) {
  return knex.schema.table("experiences", (table) => {
    table.string("is_restaurant_location");
  });
};

exports.down = function (knex) {
  return knex.schema.table("experiences", (table) => {
    table.dropColumn("is_restaurant_location");
  });
};
