
exports.up = function(knex) {
  return knex.schema.createTable("festivals", table => {
    table.increments("festival_id").unsigned().primary();
    table.string("festival_name").notNullable();
    table.date("start_date").notNullable();
    table.date("end_date").notNullable();
  }).then(() => {
    return knex("festivals").insert(
      [
        {
          festival_name: "September 2020 Festival",
          start_date: new Date("2020-09-01 00:00:00"),
          end_date: new Date("2020-09-30 23:59:59")
        },
        {
          festival_name: "December 2020 Festival",
          start_date: new Date("2020-12-01 00:00:00"),
          end_date: new Date("2020-12-31 23:59:59")
        },
        {
          festival_name: "March 2021 Festival",
          start_date: new Date("2021-03-01 00:00:00"),
          end_date: new Date("2021-03-31 23:59:59")
        }
      ]
    );
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("festivals");
};
