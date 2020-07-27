
exports.up = function(knex) {
  return knex.schema.createTable("tasttlig_users", table => {
    table.increments("tasttlig_user_id").unsigned().primary();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("email").unique().notNullable();
    table.string("password").notNullable();
    table.string("phone_number").notNullable();
    table.string("address");
    table.string("city");
    table.string("state");
    table.string("country");
    table.string("postal_code");
    table.string("role").notNullable();
    table.string("profile_image_link");
    table.boolean("is_email_verified").defaultTo(false);
    table.string("facebook_link");
    table.string("youtube_link");
    table.string("twitter_link");
    table.string("instagram_link");
    table.string("linkedin_link");
    table.string("website_link");
    table.text("bio_text");
    table.dateTime("created_at_datetime").notNullable();
    table.dateTime("updated_at_datetime").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("tasttlig_users");
};
