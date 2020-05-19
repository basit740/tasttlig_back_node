"use strict";

exports.up = function(knex) {
  return knex.schema.createTable("applications", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table.string("firstName").notNullable();
    table.string("lastName").notNullable();
    table.string("email").notNullable();
    table.string("phone").notNullable();
    table.string("city").notNullable();
    table.string("businesscity").notNullable();
    table.string("state").notNullable();
    table.string("country").notNullable();
    table.string("postalCode").notNullable();
    table.string("registrationNumber");
    table.string("facebook");
    table.string("instagram");
    table.string("yelpReviews");
    table.string("googleReview");
    table.string("tripAdviserReview");
    table.string("instagramReview");
    table.string("youtubeReview");
    table.string("mediaRecognition");
    table.string("hostSelection").notNullable();
    table.string("hostSelectionVideo");
    table.string("Banking").notNullable();
    table.string("businesstype").notNullable();
    table.string("culture").notNullable();
    table.string("culturesToExplore");
    table.string("Insurance");
    table.string("businessName").notNullable();
    table.string("onlineEmail");
    table.string("payPalEmail");
    table.string("stripeAccount");
    table.string("addressline1").notNullable();
    table.string("addressline2");
    table.string("Health");
    table.string("foodHandler");
    table.string("insuranceFile");
    table.string("bankNumber");
    table.string("accountNumber");
    table.string("institutionNumber");
    table.string("voidCheque");
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("applications");
};
