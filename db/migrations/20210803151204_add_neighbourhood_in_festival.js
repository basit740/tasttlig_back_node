exports.up = function(knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.bigInteger("festival_neighbourhood_id")
      .unsigned()
      .index()
      .references("neighbourhood_id")
      .inTable("neighbourhood")
      .onDelete("CASCADE")
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("festivals", (table) => {
    table.dropColumn("festival_neighbourhood_id");
  });
};
