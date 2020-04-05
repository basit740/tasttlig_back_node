"use strict";

// Purchases table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
// const qrCode = require("qrcode");
const Mailer = require("../../../routes/auth/nodemailer");

// Export purchases table
module.exports = {
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
    // const ready_time = purchase.ready_time;
    // const ready_time_type = purchase.ready_time_type;
    // const expiry_time = purchase.expiry_time;
    // const expiry_time_type = purchase.expiry_time_type;
    const food_ad_code = purchase.food_ad_code;
    const order_ad_code = purchase.order_ad_code;
    const phone_number = purchase.phone_number;
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
          // ready_time,
          // ready_time_type,
          // expiry_time,
          // expiry_time_type,
          food_ad_code,
          order_ad_code,
          phone_number,
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
              // Convert food ad code to QR code
              // let foodQrCode = await qrCode.toString(food_code);
              // Async food ad coupon claimed email
              await Mailer.transporter.sendMail({
                from: process.env.KODEDE_EMAIL,
                to: receipt_email,
                subject: `[Kodede] Your coupon is claimed for ${description}`,
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
                        <div>
                          Please present this coupon to redeem your ${description} (${food_ad_street_address}, ${food_ad_city}, ${food_ad_province_territory} ${food_ad_postal_code}). 
                          Code is ${food_ad_code}. 
                          Offer expires within 24 hours.<br><br>
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
  updatePurchase: async (purchase, id) => {
    const first_name = purchase.first_name;
    const last_name = purchase.last_name;
    const description = purchase.description;
    const food_ad_street_address = purchase.food_ad_street_address;
    const food_ad_city = purchase.food_ad_city;
    const food_ad_province_territory = purchase.food_ad_province_territory;
    const food_ad_postal_code = purchase.food_ad_postal_code;
    const food_ad_code = purchase.food_ad_code;
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
            expiresIn: "1d"
          },
          async () => {
            try {
              // Async food ad coupon redeemed email
              await Mailer.transporter.sendMail({
                from: process.env.KODEDE_EMAIL,
                to: receipt_email,
                subject: `[Kodede] Your coupon is redeemed for ${description}`,
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
                        <div>
                          Your coupon has been redeemed for ${description} (${food_ad_street_address}, ${food_ad_city}, ${food_ad_province_territory} ${food_ad_postal_code}). 
                          Code is ${food_ad_code}. 
                          Please visit Kodede again to experience the world locally.<br><br>
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
