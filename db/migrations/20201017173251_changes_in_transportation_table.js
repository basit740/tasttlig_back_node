exports.up = function (knex) {
  return knex.schema.table("transportation", (table) => {
    table.renameColumn("user_id", "creator_user_id");
    table.dropColumn("make");
    table.dropColumn("model");
    table.dropColumn("year");
    table.dropColumn("color");
    table.dropColumn("capacity");
    table.dropColumn("charge_per_km");
    table.string("name");
    table.string("type");
    table.string("price");
    table.string("unit");
  });
};

exports.down = function (knex) {
  return knex.schema.table("transportation", (table) => {
    table.renameColumn("creator_user_id", "user_id");
    table.string("make");
    table.string("model");
    table.string("year");
    table.string("color");
    table.string("capacity");
    table.string("charge_per_km");
    table.dropColumn("name");
    table.dropColumn("type");
    table.dropColumn("price");
    table.dropColumn("unit");
  });
};
