exports.up = function (knex) {
  return knex("roles").insert([
    {
      role: "GUEST",
      role_code: "GUA1",
    },
  ]);
};

exports.down = function (knex) {
  const new_role_code_list = ["GUA1"];
  return knex("user_role_lookup")
    .whereIn("role_code", new_role_code_list)
    .del()
    .then(() => {
      return knex("roles").whereIn("role_code", new_role_code_list).del();
    });
};
