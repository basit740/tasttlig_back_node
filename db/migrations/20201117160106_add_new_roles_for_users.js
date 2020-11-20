
exports.up = function(knex) {
  return knex("roles").insert(
    [
      {
        role: "RESTAURANT",
        role_code: "7SK2"
      },{
      role: "RESTAURANT_PENDING",
      role_code: "H9D5"
    }
    ]
  );
};

exports.down = function(knex) {
  const new_role_code_list = ['7SK2', 'H9D5'];
  return knex("user_role_lookup")
    .whereIn("role_code", new_role_code_list)
    .del()
    .then(() => {
      return knex("roles")
        .whereIn("role_code", new_role_code_list)
        .del();
    });
};
