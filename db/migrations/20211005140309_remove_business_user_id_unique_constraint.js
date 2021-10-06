exports.up = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    table.dropUnique('user_id');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("business_details", (table) => {
    table.unique('user_id');
  });

};
  
