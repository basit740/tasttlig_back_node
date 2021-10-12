exports.up = function (knex) {
  return knex.schema.table("festivals", (table) => {
    table.string("promo_code").unique();
  });
};

exports.down = function (knex) {
  return knex.schema.table("festivals", (table) => {
    table.dropColumn("promo_code");
  });
};
