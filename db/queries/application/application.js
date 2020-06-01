"use strict";

// Application table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export Applications table
module.exports = {
  getUserapplication: async user_id => {
    try {
      const returning = await db("applications").where("user_id", user_id);
      return { success: true, applications: returning };
    } catch (err) {
      return { success: false, message: "No Application found." };
    }
  },
  getAllapplication: async () => {
    try {
      const returning = await db("applications").where("quantity", ">", 0);
      return { success: true, applications: returning };
    } catch (err) {
      return { success: false, message: "No Application found." };
    }
  },
  createapplication: async (application) => {
    const first_name= application.first_name;
    const last_name= application.last_name;
    const email= application.email;
    const phone= application.phone;
    const city= application.city;
    const business_city= application.business_city;
    const state= application.state;
    const country= application.country;
    const postal_code= application.postal_code;
    const registration_number= application.registration_number;
    const facebook= application.facebook;
    const instagram= application.instagram;
    const yelp_reviews= application.yelp_reviews;
    const google_review= application.google_review;
    const tripAdviser_review= application.tripAdviser_review;
    const instagram_review= application.instagram_review;
    const youtube_review= application.youtube_review;
    const media_recognition= application.media_recognition;
    const host_selection= application.host_selection;
    const host_selection_video= application.host_selection_video;
    const banking= application.banking;
    const business_type= application.business_type;
    const issue_date= application.issue_date;
    const expiry_date= application.expiry_date;
    const culture= application.culture;
    const cultures_to_explore= application.cultures_to_explore;
    const insurance= application.insurance;
    const business_name= application.business_name;
    const online_email= application.online_email;
    const payPal_email= application.payPal_email;
    const stripe_account= application.stripe_account;
    const address_line_1= application.address_line_1;
    const address_line_2= application.address_line_2;
    const health_safety_certificate= application.health_safety_certificate;
    const insurance_file= application.insurance_file;
    const food_handler_certificate= application.food_handler_certificate;
    const bank_number= application.bank_number;
    const account_number= application.account_number;
    const institution_number= application.institution_number;
    const void_cheque= application.void_cheque;
    try {
      const returning = await db("applications")
        .insert({
          first_name,
          last_name,
          email,
          phone,
          city,
          business_city,
          state,
          country,
          postal_code,
          registration_number,
          facebook,
          instagram,
          yelp_reviews,
          google_review,
          tripAdviser_review,
          instagram_review,
          youtube_review,
          media_recognition,
          host_selection,
          host_selection_video,
          banking,
          business_type,
          culture,
          cultures_to_explore,
          insurance,
          business_name,
          online_email,
          payPal_email,
          stripe_account,
          address_line_1,
          address_line_2,
          health_safety_certificate,
          insurance_file,
          food_handler_certificate,
          bank_number,
          account_number,
          institution_number,
          void_cheque,
          issue_date,
          expiry_date
        })
        .returning("*");
      if (returning) return (response = { success: true});
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
};
