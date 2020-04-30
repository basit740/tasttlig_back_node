"use strict";

// Guests table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

// Export guests table
module.exports = {
  getAllGuest: async () => {
    try {
      const returning = await db("guests");
      return { success: true, guests: returning };
    } catch (err) {
      return { success: false, message: "No guest found." };
    }
  },
  createGuest: async guest => {
    const food_ad_id = guest.food_ad_id;
    const food_ad_img_url = guest.food_ad_img_url;
    const guest_email = guest.guest_email;
    // const quantity = guest.quantity;
    const description = guest.description;
    const cost = guest.cost;
    const food_ad_street_address = guest.food_ad_street_address;
    const food_ad_city = guest.food_ad_city;
    const food_ad_province_territory = guest.food_ad_province_territory;
    const food_ad_postal_code = guest.food_ad_postal_code;
    const date = guest.date;
    const start_time = guest.start_time;
    const end_time = guest.end_time;
    const food_ad_code = guest.food_ad_code;
    const food_ad_email = guest.food_ad_email;
    // const receipt_url = guest.receipt_url;
    // const fingerprint = guest.fingerprint;
    const claimed = guest.claimed;
    try {
      const returning = await db("guests")
        .insert({
          food_ad_id,
          food_ad_img_url,
          guest_email,
          // quantity,
          description,
          cost,
          food_ad_street_address,
          food_ad_city,
          food_ad_province_territory,
          food_ad_postal_code,
          date,
          start_time,
          end_time,
          food_ad_code,
          food_ad_email,
          // receipt_url,
          // fingerprint,
          claimed
        })
        .returning("*");
      if (returning) {
        jwt.sign(
          { guest: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "1d"
          },
          async () => {
            try {
              // Async food ad coupon claimed email
              const mail_list_claimed = [
                process.env.KODEDE_ADMIN_EMAIL,
                food_ad_email
              ];
              await Mailer.transporter.sendMail({
                from: process.env.KODEDE_AUTOMATED_EMAIL,
                to: guest_email,
                bcc: mail_list_claimed,
                subject: `[Kodede] Your coupon is claimed for ${description}`,
                html:  `<div>Hello,<br><br></div>
                        <div>
                          Please present this coupon to redeem your ${description}.<br><br>
                        </div>
                        <div>
                          Address: ${food_ad_street_address}, ${food_ad_city}, ${food_ad_province_territory} ${food_ad_postal_code}<br>
                          Date: ${date}<br>
                          Start Time: ${start_time}<br>
                          End Time: ${end_time}<br><br>
                        </div>
                        <div>
                          Code is ${food_ad_code}.<br><br>
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
      return (response = { success: true });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  updateGuest: async (guest, id) => {
    const guest_email = guest.guest_email;
    const description = guest.description;
    const food_ad_street_address = guest.food_ad_street_address;
    const food_ad_city = guest.food_ad_city;
    const food_ad_province_territory = guest.food_ad_province_territory;
    const food_ad_postal_code = guest.food_ad_postal_code;
    const date = guest.date;
    const start_time = guest.start_time;
    const end_time = guest.end_time;
    const food_ad_code = guest.food_ad_code;
    const food_ad_email = guest.food_ad_email;
    const redeemed = guest.redeemed;
    try {
      const returning = await db("guests")
        .where("id", id)
        .update({
          redeemed
        })
        .returning("*");
      if (redeemed) {
        jwt.sign(
          { guest: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "1d"
          },
          // Async food ad coupon redeemed email
          async () => {
            try {
              const mail_list_redeemed = [
                process.env.KODEDE_ADMIN_EMAIL,
                food_ad_email
              ];
              await Mailer.transporter.sendMail({
                from: process.env.KODEDE_AUTOMATED_EMAIL,
                to: guest_email,
                bcc: mail_list_redeemed,
                subject: `[Kodede] Your coupon is redeemed for ${description}`,
                html:  `<div>Hello,<br><br></div>
                        <div>
                          Your coupon has been redeemed for ${description}.<br><br>
                        </div>
                        <div>
                          Address: ${food_ad_street_address}, ${food_ad_city}, ${food_ad_province_territory} ${food_ad_postal_code}<br>
                          Date: ${date}<br>
                          Start Time: ${start_time}<br>
                          End Time: ${end_time}<br><br>
                        </div>
                        <div>
                          Code is ${food_ad_code}.<br><br>
                        </div>
                        <div>
                          Please visit Kodede again to taste food from around the world.<br><br>
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
  },
  deleteGuest: async id => {
    try {
      const returning = await db("guests")
        .where("id", id)
        .del();
      if (returning) {
        return {
          success: true,
          message: "Guest has been deleted."
        };
      }
    } catch (err) {
      return { success: false, data: err };
    }
  }
};
