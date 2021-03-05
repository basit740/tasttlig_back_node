exports.up = function(knex) {
    return knex("roles").insert(
      [
        {
          role: "BUSINESS_MEMBER",
          role_code: "BMA1"
        },{
          role: "BUSINESS_MEMBER_PENDING",
          role_code: "BMP1"
        }
      ]
    );
  };
  
  exports.down = function(knex) {
    const new_role_code_list = ["BMP1", "BMA1"];
    return knex("user_role_lookup")
      .whereIn("role_code", new_role_code_list)
      .del()
      .then(() => {
        return knex("roles")
          .whereIn("role_code", new_role_code_list)
          .del();
      });
  };
  