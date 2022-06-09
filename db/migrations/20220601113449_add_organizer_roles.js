exports.up = function (knex) {
    return knex("roles").insert([
      {
        role: "FESTIVAL_ORGANIZER",
        role_code: "FO",
      },
      {
        role: "FESTIVAL_ORGANIZER_PENDING",
        role_code: "FOP",
      },
      {
        role: "EXPERIENCE_ORGANIZER",
        role_code: "EO",
      },
      {
        role: "EXPERIENCE_ORGANIZER_PENDING",
        role_code: "EOP",
      },
    ]);
  };
  
  exports.down = function (knex) {
    const new_role_code_list = ["FO", "FOP", "EO", "EOP"];
    return knex("user_role_lookup")
      .whereIn("role_code", new_role_code_list)
      .del()
      .then(() => {
        return knex("roles").whereIn("role_code", new_role_code_list).del();
      });
  };
  