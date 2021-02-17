exports.up = function(knex) {
    return knex.schema.alterTable("hosts", table => {
      
      table.string("host_video_url");
      table.string("host_government_id_url");
      
    });
};
  
  exports.down = function(knex) {
    return knex.schema.alterTable("hosts", table => {
        table.dropColumn("host_video_url");
		table.dropColumn("host_government_id_url");
    });
  };