exports.up = function(knex) {
  return knex.schema.alterTable("applications", table => {
    table.integer("festival_id");
    table.integer("receiver_id");
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("applications", table => {
      table.dropColumn("festival_id");
      table.dropColumn("receiver_id");
  });
};