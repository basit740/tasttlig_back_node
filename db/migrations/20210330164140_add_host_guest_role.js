exports.up = function(knex) {
    return knex("roles").insert(
      [
        {
          role: "HOST_GUEST",
          role_code: "HGST"
        }
      ]
    );
  };
  
  exports.down = function(knex) {
    const new_role_code_list = ["HGST"];
    return knex("user_role_lookup")
      .whereIn("role_code", new_role_code_list)
      .del()
      .then(() => {
        return knex("roles")
          .whereIn("role_code", new_role_code_list)
          .del();
      });
  };
  