exports.up = function(knex) {
  return knex.schema.table("experiences", table => {
    table.text("review_experience_reason");
  });
};

exports.down = function(knex) {
  return knex.schema.table("experiences", table => {
    table.dropColumn("review_experience_reason");
  });
};
