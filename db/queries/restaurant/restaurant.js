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
    const food_business_name = restaurant.food_business_name;
    const food_business_number = restaurant.food_business_number;
    const food_business_license = restaurant.food_business_license;
    const food_business_license_date_of_issue =
      restaurant.food_business_license_date_of_issue;
    const restaurant_address = restaurant.restaurant_address;
    const restaurant_city = restaurant.restaurant_city;
    const restaurant_province_territory =
      restaurant.restaurant_province_territory;
    const restaurant_postal_code = restaurant.restaurant_postal_code;
    const restaurant_email = restaurant.restaurant_email;
    const restaurant_phone_number = restaurant.restaurant_phone_number;
    const dine_safe_license = restaurant.dine_safe_license;
    const dine_safe_result = restaurant.dine_safe_result;
    const dine_safe_reason = restaurant.dine_safe_reason;
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
    const food_business_logo = restaurant.food_business_logo;
    const food_business_photo = restaurant.food_business_photo;
    const food_business_story = restaurant.food_business_story;
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
          food_business_name,
          food_business_number,
          food_business_license,
          food_business_license_date_of_issue,
          restaurant_address,
          restaurant_city,
          restaurant_province_territory,
          restaurant_postal_code,
          restaurant_email,
          restaurant_phone_number,
          dine_safe_license,
          dine_safe_result,
          dine_safe_reason,
          food_handler_certificate,
          food_handler_certificate_date_of_issue,
          food_handler_certificate_expiry_date,
          food_business_insurance,
          food_business_insurance_date_of_issue,
          food_business_insurance_expiry_date,
          food_business_logo,
          food_business_photo,
          food_business_story,
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
                html: `<div>Hello ${first_name} ${last_name},<br><br></div>
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
                html: `<div>Hello ${first_name} ${last_name},<br><br></div>
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
