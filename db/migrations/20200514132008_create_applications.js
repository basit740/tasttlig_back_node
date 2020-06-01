"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("applications", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("email").notNullable();
    table.string("phone").notNullable();
    table.string("city").notNullable();
    table.string("business_city").notNullable();
    table.string("state").notNullable();
    table.string("country").notNullable();
    table.string("postal_code").notNullable();
    table.string("issue_date").notNullable();
    table.string("expiry_date").notNullable();
    table.string("registration_number");
    table.string("facebook");
    table.string("instagram");
    table.string("yelp_reviews");
    table.string("google_review");
    table.string("tripAdviser_review");
    table.string("instagram_review");
    table.string("youtube_review");
    table.string("media_recognition");
    table.string("host_selection").notNullable();
    table.string("host_selection_video");
    table.string("banking").notNullable();
    table.string("business_type").notNullable();
    table.string("culture").notNullable();
    table.string("cultures_to_explore");
    table.string("insurance");
    table.string("business_name").notNullable();
    table.string("online_email");
    table.string("payPal_email");
    table.string("stripe_account");
    table.string("address_line_1").notNullable();
    table.string("address_line_2");
    table.string("health_safety_certificate");
    table.string("food_handler_certificate");
    table.string("insurance_file");
    table.string("bank_number");
    table.string("account_number");
    table.string("institution_number");
    table.string("void_cheque");
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("applications");
};
