
exports.up = function (knex) {
    return knex.schema.table("experiences", (table) => {
      table.string("experience_days");
      table.string("experience_hours");
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table("experiences", (table) => {
      table.dropColumn("experience_days");
      table.dropColumn("experience_hours");
    });
  };