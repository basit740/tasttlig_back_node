"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("applications", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table
      .string("email")
      .unique()
      .notNullable();
    table.string("phone_number").notNullable();
    table.string("city").notNullable();
    table.string("business_name").notNullable();
    table.string("business_type").notNullable();
    table.string("culture").notNullable();
    table.string("culture_to_explore");
    table.string("address_line_1").notNullable();
    table.string("address_line_2");
    table.string("business_city").notNullable();
    table.string("state").notNullable();
    table.string("postal_code").notNullable();
    table.string("country").notNullable();
    table.string("registration_number");
    table.string("facebook");
    table.string("instagram");
    table.string("food_handler_certificate").notNullable();
    table.string("date_of_issue").notNullable();
    table.string("expiry_date").notNullable();
    table.string("insurance");
    table.string("insurance_file");
    table.string("health_safety_certificate");
    table.string("banking").notNullable();
    table.string("bank_number");
    table.string("account_number");
    table.string("institution_number");
    table.string("void_cheque");
    table.string("online_email");
    table.string("paypal_email");
    table.string("stripe_account");
    table.string("yelp_review");
    table.string("google_review");
    table.string("tripadvisor_review");
    table.string("instagram_review");
    table.string("youtube_review");
    table.string("media_recognition");
    table.string("host_selection").notNullable();
    table.string("host_selection_video");
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("applications");
};
