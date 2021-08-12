//updating prodcts table

exports.up = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.text("additional_information");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.dropColumn("additional_information");
  });
};
