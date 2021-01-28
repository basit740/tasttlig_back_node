exports.up = function (knex) {
  return knex.schema.table("experiences", (table) => {
    table.specificType("experience_user_guest_id", "INT[]");
  });
};

exports.down = function (knex) {
  return knex.schema.table("experiences", (table) => {
    table.dropColumn("experience_user_guest_id");
  });
};
