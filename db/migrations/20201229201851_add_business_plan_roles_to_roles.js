exports.up = function (knex) {
  return knex("roles").insert([
    {
      role: "MEMBER_BUSINESS_BASIC",
      role_code: "MBB1",
    },
    {
      role: "MEMBER_BUSINESS_INTERMEDIATE",
      role_code: "MBI2",
    },
    {
      role: "MEMBER_BUSINESS_ADVANCED",
      role_code: "MBA3",
    },
  ]);
};

exports.down = function (knex) {
  const new_role_code_list = ["MBB1", "MBI2", "MBA3"];
  return knex("user_role_lookup")
    .whereIn("role_code", new_role_code_list)
    .del()
    .then(() => {
      return knex("roles").whereIn("role_code", new_role_code_list).del();
    });
};
