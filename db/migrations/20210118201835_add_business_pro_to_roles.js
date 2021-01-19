exports.up = function (knex) {
  return knex("roles").insert([
    {
      role: "MEMBER_BUSINESS_PRO",
      role_code: "MBP4",
    },
  ]);
};

exports.down = function (knex) {
  const new_role_code_list = ["MBP4"];
  return knex("user_role_lookup")
    .whereIn("role_code", new_role_code_list)
    .del()
    .then(() => {
      return knex("roles").whereIn("role_code", new_role_code_list).del();
    });
};
