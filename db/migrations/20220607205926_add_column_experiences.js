exports.up = function (knex) {
    return knex.schema.alterTable("experiences", (table) => {
      table.boolean("has_food");
      table.boolean("has_music");
      table.boolean("has_arts");
      table.boolean("has_balloons");
      table.boolean("has_venues");
    });
  };
  exports.down = function (knex) {
    return knex.schema.alterTable("experiences", (table) => {
      table.dropColumn("has_food");
      table.dropColumn("has_music");
      table.dropColumn("has_arts");
      table.dropColumn("has_balloons");
      table.dropColumn("has_venues");
    });
  };
  