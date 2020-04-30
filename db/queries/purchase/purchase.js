"use strict";

// Purchases table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

// Export purchases table
module.exports = {
  getUserPurchase: async user_id => {
    try {
      const returning = await db("purchases").where("user_id", user_id);
      return { success: true, purchases: returning };
    } catch (err) {
      return { success: false, message: "No purchase found." };
    }
  },
  getAllPurchase: async () => {
    try {
      const returning = await db("purchases");
      return { success: true, purchases: returning };
    } catch (err) {
      return { success: false, message: "No purchase found." };
    }
  },
  createPurchase: async (purchase, user_id) => {
    const food_ad_number = purchase.food_ad_number;
    const profile_img_url = purchase.profile_img_url;
    const first_name = purchase.first_name;
    const last_name = purchase.last_name;
    const food_ad_img_url = purchase.food_ad_img_url;
    // const quantity = purchase.quantity;
    const description = purchase.description;
    const cost = purchase.cost;
    const food_ad_street_address = purchase.food_ad_street_address;
    const food_ad_city = purchase.food_ad_city;
    const food_ad_province_territory = purchase.food_ad_province_territory;
    const food_ad_postal_code = purchase.food_ad_postal_code;
    const date = purchase.date;
    const start_time = purchase.start_time;
    const end_time = purchase.end_time;
    const food_ad_code = purchase.food_ad_code;
    const phone_number = purchase.phone_number;
    const food_ad_email = purchase.food_ad_email;
    const receipt_email = purchase.receipt_email;
    // const receipt_url = purchase.receipt_url;
    // const fingerprint = purchase.fingerprint;
    const claimed = purchase.claimed;
    try {
      const returning = await db("purchases")
        .insert({
          user_id,
          food_ad_number,
          profile_img_url,
          first_name,
          last_name,
          food_ad_img_url,
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
          phone_number,
          food_ad_email,
          receipt_email,
          // receipt_url,
          // fingerprint,
          claimed
        })
        .returning("*");
      if (returning) {
        jwt.sign(
          { purchase: returning[0].user_id },
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
                to: receipt_email,
                bcc: mail_list_claimed,
                subject: `[Kodede] Your coupon is claimed for ${description}`,
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
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
      return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  updatePurchase: async (purchase, id) => {
    const food_ad_number = purchase.food_ad_number;
    const first_name = purchase.first_name;
    const last_name = purchase.last_name;
    const description = purchase.description;
    const food_ad_street_address = purchase.food_ad_street_address;
    const food_ad_city = purchase.food_ad_city;
    const food_ad_province_territory = purchase.food_ad_province_territory;
    const food_ad_postal_code = purchase.food_ad_postal_code;
    const date = purchase.date;
    const start_time = purchase.start_time;
    const end_time = purchase.end_time;
    const food_ad_code = purchase.food_ad_code;
    const food_ad_email = purchase.food_ad_email;
    const receipt_email = purchase.receipt_email;
    const redeemed = purchase.redeemed;
    try {
      const returning = await db("purchases")
        .where("id", id)
        .update({
          redeemed
        })
        .returning("*");
      if (redeemed) {
        jwt.sign(
          { purchase: returning[0].user_id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "14d"
          },
          // Async food ad coupon redeemed email
          async () => {
            try {
              const url = `http://localhost:3000/feedback/${food_ad_number}`;
              const mail_list_redeemed = [
                process.env.KODEDE_ADMIN_EMAIL,
                food_ad_email
              ];
              await Mailer.transporter.sendMail({
                from: process.env.KODEDE_AUTOMATED_EMAIL,
                to: receipt_email,
                bcc: mail_list_redeemed,
                subject: `[Kodede] Your coupon is redeemed for ${description}`,
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
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
                          <a href="${url}">Write a Feedback</a><br><br>
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
  }
};
