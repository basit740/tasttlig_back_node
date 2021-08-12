exports.up = function (knex) {
  const new_role_code_list = ["H9D5"];
  return knex("user_role_lookup")
    .whereIn("role_code", new_role_code_list)
    .del()
    .then(() => {
      return knex("roles").whereIn("role_code", new_role_code_list).del();
    });
};

exports.down = function (knex) {
  return knex("roles").insert([
    { role: "RESTAURANT_PENDING", description: "H9D5" },
  ]);
};
