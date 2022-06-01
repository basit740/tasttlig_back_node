exports.up = function (knex) {
    return knex.schema.alterTable("applications", (table) => {
      table.specificType("neighbourhood_interested", "VARCHAR[]");
      table.string("referred_by");
      table.dateTime("available_to_start");
      table.string("ref_name_1");
      table.string("ref_email_1");
      table.string("ref_phone_1");
      table.string("ref_name_2");
      table.string("ref_email_2");
      table.string("ref_phone_2");
    });
  };
  exports.down = function (knex) {
    return knex.schema.alterTable("applications", (table) => {
      table.dropColumn("neighbourhood_interested");
      table.dropColumn("referred_by");
      table.dropColumn("available_to_start");
      table.dropColumn("ref_name_1");
      table.dropColumn("ref_email_1");
      table.dropColumn("ref_phone_1");
      table.dropColumn("ref_name_2");
      table.dropColumn("ref_email_2");
      table.dropColumn("ref_phone_2");
    });
  };
  