"use strict";

// Restaurant table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

// Export restaurant table
module.exports = {
  getAllRestaurant: async () => {
    try {
      const returning = await db("restaurants");
      return { success: true, restaurants: returning };
    } catch (err) {
      return { success: false, message: "No restaurant found." };
    }
  },
  createRestaurant: async (restaurant, user_id) => {
    const profile_img_url = restaurant.profile_img_url;
    const first_name = restaurant.first_name;
    const last_name = restaurant.last_name;
    const email = restaurant.email;
    const phone_number = restaurant.phone_number;
    const profile_type = restaurant.profile_type;
    const food_business_license = restaurant.food_business_license;
    const food_business_license_date_of_issue =
      restaurant.food_business_license_date_of_issue;
    const food_business_license_expiry_date =
      restaurant.food_business_license_expiry_date;
    const food_handler_certificate = restaurant.food_handler_certificate;
    const food_handler_certificate_date_of_issue =
      restaurant.food_handler_certificate_date_of_issue;
    const food_handler_certificate_expiry_date =
      restaurant.food_handler_certificate_expiry_date;
    const food_business_insurance = restaurant.food_business_insurance;
    const food_business_insurance_date_of_issue =
      restaurant.food_business_insurance_date_of_issue;
    const food_business_insurance_expiry_date =
      restaurant.food_business_insurance_expiry_date;
    const certified = restaurant.certified;
    try {
      const returning = await db("restaurants")
        .insert({
          user_id,
          profile_img_url,
          first_name,
          last_name,
          email,
          phone_number,
          profile_type,
          food_business_license,
          food_business_license_date_of_issue,
          food_business_license_expiry_date,
          food_handler_certificate,
          food_handler_certificate_date_of_issue,
          food_handler_certificate_expiry_date,
          food_business_insurance,
          food_business_insurance_date_of_issue,
          food_business_insurance_expiry_date,
          certified
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  updateRestaurant: async (restaurant, id) => {
    const first_name = restaurant.first_name;
    const last_name = restaurant.last_name;
    const email = restaurant.email;
    const certified = restaurant.certified;
    const reject_note = restaurant.reject_note;
    try {
      const returning = await db("restaurants")
        .where("id", id)
        .update({ first_name, last_name, email, certified, reject_note })
        .returning("*");
      if (returning && certified) {
        jwt.sign(
          { restaurant: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "15m"
          },
          async () => {
            try {
              // Async commercial member application accepted email
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.KODEDE_ADMIN_EMAIL,
                subject: `[Kodede] Your application as commercial member is accepted`,
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
                        <div>
                          Congratulations! Your application as commercial member is accepted from Kodede. You can now publish food in the marketplace for people to taste food from around the world.<br><br>
                        </div>
                        <div>
                          Sent with <3 from Kodede (Created By Tasttlig).<br><br>
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
      } else if (returning && reject_note) {
        jwt.sign(
          { restaurant: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "15m"
          },
          async () => {
            try {
              // Async commercial member application rejected email
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.KODEDE_ADMIN_EMAIL,
                subject: `[Kodede] Your application as commercial member is rejected`,
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
                        <div>
                          We regret to inform you that your application as commercial member is rejected from Kodede. Please see the reason below. If you wish to apply again, consider the feedback shared for the next time.<br><br>
                        </div>
                        <div>
                          Reject Reason: ${reject_note}<br><br>
                        </div>
                        <div>
                          Sent with <3 from Kodede (Created By Tasttlig).<br><br>
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
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  }
};
