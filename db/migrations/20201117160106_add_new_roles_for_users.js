
exports.up = function(knex) {
  return knex("roles").insert(
    [
      {
        role: "RESTAURANT",
        role_code: "7SK2"
      },{
      role: "RESTAURANT_PENDING",
      role_code: "H9D5"
    },{
      role: "MEMBER",
      role_code: "7DI1"
    },{
      role: "HOST",
      role_code: "KJ7D"
    },{
      role: "ADMIN",
      role_code: "5X2P"
    },{
      role: "HOST_PENDING",
      role_code: "JUCR"
    },{
      role: "VISITOR",
      role_code: "EYT6"
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
