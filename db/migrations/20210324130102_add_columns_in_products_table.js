exports.up = function(knex) {
    return knex.schema.alterTable("products", table => {
      table.specificType("dietary_restrictions", 'VARCHAR[]');
      table.specificType("spice_level", 'VARCHAR[]');
      table.specificType("days_available", 'VARCHAR[]');
    });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("products", table => {
        table.dropColumn("dietary_restrictions");
        table.dropColumn("spice_level");
        table.dropColumn("days_available");
    });
  };