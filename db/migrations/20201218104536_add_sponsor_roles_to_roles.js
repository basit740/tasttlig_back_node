exports.up = function (knex) {
  return knex("roles").insert([
    {
      role: "SPONSOR",
      role_code: "GP9A",
    },
    {
      role: "SPONSOR_PENDING",
      role_code: "T7S8",
    },
  ]);
};

exports.down = function (knex) {
  const new_role_code_list = ["GP9A", "T7S8"];
  return knex("user_role_lookup")
    .whereIn("role_code", new_role_code_list)
    .del()
    .then(() => {
      return knex("roles").whereIn("role_code", new_role_code_list).del();
    });
};
