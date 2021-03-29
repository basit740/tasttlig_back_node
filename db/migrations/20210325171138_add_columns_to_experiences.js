exports.up = function(knex) {
    return knex.schema.alterTable("experiences", table => {
      table.string("experience_type");
      table.date("start_date");
      table.date("end_date");
      table.time("start_time");
      table.time("end_time");
      table.specificType("services_selected", 'INT[]');
      table.specificType("products_selected", 'INT[]');
      table.string("additional_pricing_info");
      table.string("RSVP");
      table.text("additional_information"); 

    });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("experiences", table => {
        
        table.dropColumn("experience_type");
        table.dropColumn("start_date");
        table.dropColumn("end_date");
        table.dropColumn("start_time");
        table.dropColumn("end_time");
        table.dropColumn("services_selected");
        table.dropColumn("products_selected");
        table.dropColumn("additional_pricing_info");
        table.dropColumn("RSVP");
        table.dropColumn("additional_information");
        
    });
  };