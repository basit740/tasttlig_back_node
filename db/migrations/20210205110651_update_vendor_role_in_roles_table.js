
exports.up = function(knex) {
    return knex("roles").insert(
      [
        {
          role: "VENDOR",
          role_code: "VSK1"
        },{
        role: "VENDOR_PENDING",
        role_code: "VSK2"
      }
      ]
    );
  };
  
  exports.down = function(knex) {
    const new_role_code_list = ['VSK1', 'VSK2'];
    return knex("user_role_lookup")
      .whereIn("role_code", new_role_code_list)
      .del()
      .then(() => {
        return knex("roles")
          .whereIn("role_code", new_role_code_list)
          .del();
      });
  };
  