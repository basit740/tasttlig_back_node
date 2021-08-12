const { generateRandomString } = require("../../functions/functions");

exports.up = function (knex) {
  return knex.schema
    .createTable("roles", (table) => {
      table.increments("role_id").unsigned().primary();
      table.string("role").notNullable();
      table.string("role_code").notNullable().unique().index();
    })
    .then(() => {
      return knex("tasttlig_users")
        .distinctOn("role")
        .then((role_rows) => {
          let distinct_roles = [];
          role_rows.map((role_row) => {
            let role_list = role_row.role.split(",");
            role_list.map((role) => {
              let roleFound = false;
              distinct_roles.some((distinct_role) => {
                if (distinct_role.role == role) {
                  roleFound = true;
                  return true;
                }
              });
              if (!roleFound) {
                distinct_roles.push({
                  role: role,
                  role_code: generateRandomString(4),
                });
              }
            });
          });
          return knex("roles").insert(distinct_roles);
        });
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("roles");
};
