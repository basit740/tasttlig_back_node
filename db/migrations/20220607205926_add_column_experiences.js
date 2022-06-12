exports.up = function (knex) {
    return knex.schema.alterTable("experiences", (table) => {
      table.boolean("has_food");
      table.boolean("has_music");
      table.boolean("has_arts");
      table.boolean("has_balloons");
      table.boolean("has_venues");
      table.string("experience_postal_code");
      table.string("experience_country");
      table.string("experience_province");
      table.string("experience_city");
      table.string("experience_address_1");
      table.string("experience_address_2");
    });
  };
  exports.down = function (knex) {
    return knex.schema.alterTable("experiences", (table) => {
      table.dropColumn("has_food");
      table.dropColumn("has_music");
      table.dropColumn("has_arts");
      table.dropColumn("has_balloons");
      table.dropColumn("has_venues");
      table.dropColumn("experience_postal_code");
      table.dropColumn("experience_country");
      table.dropColumn("experience_province");
      table.dropColumn("experience_city");
      table.dropColumn("experience_address_1");
      table.dropColumn("experience_address_2");
    });
  };
  