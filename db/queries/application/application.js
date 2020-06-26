"use strict";

// Application table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

// Export Applications table
module.exports = {
  getUserApplication: async user_id => {
    try {
      const returning = await db("applications").where("user_id", user_id);
      return { success: true, applications: returning };
    } catch (err) {
      return { success: false, message: "No Application found." };
    }
  },
  getAllApplication: async () => {
    try {
      const returning = await db("applications");
      return { success: true, applications: returning };
    } catch (err) {
      return { success: false, message: "No Application found." };
    }
  },
  createApplication: async (application, user_id) => {
    const first_name = application.first_name;
    const last_name = application.last_name;
    const email = application.email;
    const phone_number = application.phone_number;
    const city = application.city;
    const business_name = application.business_name;
    const business_type = application.business_type;
    const culture = application.culture;
    const culture_to_explore = application.culture_to_explore;
    const address_line_1 = application.address_line_1;
    const address_line_2 = application.address_line_2;
    const business_city = application.business_city;
    const state = application.state;
    const postal_code = application.postal_code;
    const country = application.country;
    const registration_number = application.registration_number;
    const facebook = application.facebook;
    const instagram = application.instagram;
    const food_handler_certificate = application.food_handler_certificate;
    const date_of_issue = application.date_of_issue;
    const expiry_date = application.expiry_date;
    const insurance = application.insurance;
    const insurance_file = application.insurance_file;
    const health_safety_certificate = application.health_safety_certificate;
    const banking = application.banking;
    const bank_number = application.bank_number;
    const account_number = application.account_number;
    const institution_number = application.institution_number;
    const void_cheque = application.void_cheque;
    const online_email = application.online_email;
    const paypal_email = application.paypal_email;
    const stripe_account = application.stripe_account;
    const yelp_review = application.yelp_review;
    const google_review = application.google_review;
    const tripadvisor_review = application.tripadvisor_review;
    const instagram_review = application.instagram_review;
    const youtube_review = application.youtube_review;
    const personal_review = application.personal_review;
    const media_recognition = application.media_recognition;
    const host_selection = application.host_selection;
    const host_selection_video = application.host_selection_video;
    const youtube_link = application.youtube_link;
    const profile_img_url = application.profile_img_url;
    try {
      const returning = await db("applications")
        .insert({
          user_id,
          first_name,
          last_name,
          email,
          phone_number,
          city,
          business_name,
          business_type,
          culture,
          culture_to_explore,
          address_line_1,
          address_line_2,
          business_city,
          state,
          postal_code,
          country,
          registration_number,
          facebook,
          instagram,
          food_handler_certificate,
          date_of_issue,
          expiry_date,
          insurance,
          insurance_file,
          health_safety_certificate,
          banking,
          bank_number,
          account_number,
          institution_number,
          void_cheque,
          online_email,
          paypal_email,
          stripe_account,
          yelp_review,
          google_review,
          tripadvisor_review,
          instagram_review,
          youtube_review,
          personal_review,
          media_recognition,
          host_selection,
          host_selection_video,
          youtube_link,
          profile_img_url
        })
        .returning("*");
      if (returning) {
        jwt.sign(
          { application: returning[0].user_id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "7d"
          },
          async () => {
            try {
              // Async apply to host confirmation email
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.TASTTLIG_ADMIN_EMAIL,
                subject: `[Tasttlig] Thank you for your application`,
                html:  `<div>
                          Hello ${first_name} ${last_name},<br><br>
                        </div>
                        <div>
                          We are so glad that you decided to host Tasttlig!
                          <br><br>
                        </div>
                        <div>
                          Our team will review your application. If you are 
                          successful, we will grant you access online to 
                          create your profile and experience.<br><br>
                        </div>
                        <div>
                          We appreciate your interest in Tasttlig and are 
                          looking forward to working with you.<br><br>
                        </div>
                        <div>Sincerely,<br><br></div>
                        <div>
                          Tasttlig Team<br><br>
                        </div>
                        <div>
                          <a 
                            href="https://tasttlig.com"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            tasttlig.com
                          </a><br><br>
                        </div>
                        <div>Tasttlig Corporation</div>
                        <div>585 Dundas St E, 3rd Floor</div>
                        <div>Toronto, ON M5A 2B7, Canada</div>`
              });
            } catch (err) {
              console.log(err);
            }
          }
        );
      }
      return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  updateApplication: async (application, id) => {
    const first_name = application.first_name;
    const last_name = application.last_name;
    const email = application.email;
    const is_host = application.is_host;
    const reject_note = application.reject_note;
    try {
      const returning = await db("applications")
        .where("id", id)
        .update({ first_name, last_name, email, is_host, reject_note })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  }
};
