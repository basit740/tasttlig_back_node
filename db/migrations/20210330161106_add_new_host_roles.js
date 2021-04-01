exports.up = function(knex) {
    return knex("roles").insert(
      [
        {
          role: "HOST_VEND",
          role_code: "HVND"
        },
        {
            role: "HOST_VEND_PENDING",
            role_code: "HVNDP"
        },
          {
            role: "HOST_AMBASSADOR",
            role_code: "HAMB"
          },
          {
            role: "HOST_AMBASSADOR_PENDING",
            role_code: "HAMBP"
          }
      ]
    );
  };
  
  exports.down = function(knex) {
            role_code: "HAMB"
    const new_role_code_list = ["HVND","HVNDP","HAMB","HAMBP"];
    return knex("user_role_lookup")
      .whereIn("role_code", new_role_code_list)
      .del()
      .then(() => {
        return knex("roles")
          .whereIn("role_code", new_role_code_list)
          .del();
      });
  };



  



  


  