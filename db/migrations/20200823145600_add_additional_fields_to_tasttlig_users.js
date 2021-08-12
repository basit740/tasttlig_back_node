exports.up = function (knex) {
  return knex.schema.table("tasttlig_users", (table) => {
    table.string("profile_tag_line");
    table.string("banner_image_link");
    table.string("address_line_1");
    table.string("address_line_2");
    table.string("address_type");
    table.string("business_name");
    table.string("business_type");
    table.string("profile_status");
  });
};

exports.down = function (knex) {
  return knex.schema.table("tasttlig_users", (table) => {
    table.dropColumn("profile_tag_line");
    table.dropColumn("banner_image_link");
    table.dropColumn("address_line_1");
    table.dropColumn("address_line_2");
    table.dropColumn("address_type");
    table.dropColumn("business_name");
    table.dropColumn("business_type");
    table.dropColumn("profile_status");
  });
};
