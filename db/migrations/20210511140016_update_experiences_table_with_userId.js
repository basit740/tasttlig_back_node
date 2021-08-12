exports.up = function (knex) {
  return knex.schema.alterTable("experiences", (table) => {
    table.integer("experience_user_id");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("experiences", (table) => {
    table.dropColumn("experience_user_id");
  });
};
