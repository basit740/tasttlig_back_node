exports.up = function (knex) {
  return knex.schema.table("assets", (table) => {
    table.string("type");
    table.string("availability");
    table.string("contact_name");
    table.string("contact_phone");
    table.decimal("price");
    table.time("start_time");
    table.time("end_time");
  });
};

exports.down = function (knex) {
  return knex.schema.table("assets", (table) => {
    table.dropColumn("type");
    table.dropColumn("availability");
    table.dropColumn("contact_name");
    table.dropColumn("contact_phone");
    table.dropColumn("price");
    table.dropColumn("start_time");
    table.dropColumn("end_time");
  });
};
