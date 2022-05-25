exports.up = function (knex) {
    return knex("roles").insert([
      {
        role: "FESTIVAL_COORDINATOR",
        role_code: "FC",
      },
      {
        role: "FESTIVAL_COORDINATOR_PENDING",
        role_code: "FCP",
      },
    ]);
  };
  
  exports.down = function (knex) {
    const new_role_code_list = ["FC", "FCP"];
    return knex("user_role_lookup")
      .whereIn("role_code", new_role_code_list)
      .del()
      .then(() => {
        return knex("roles").whereIn("role_code", new_role_code_list).del();
      });
  };
  