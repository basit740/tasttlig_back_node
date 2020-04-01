"use strict";

// Purchases table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const qrCode = require("qrcode");
const Mailer = require("../../../routes/auth/nodemailer");

// Export purchases table
module.exports = {
  createPurchase: async (purchase, user_id) => {
    const profile_img_url = purchase.profile_img_url;
    const first_name = purchase.first_name;
    const last_name = purchase.last_name;
    const food_img_url = purchase.food_img_url;
    const quantity = purchase.quantity;
    const description = purchase.description;
    const cost = purchase.cost;
    const ready_time = purchase.ready_time;
    const time_type = purchase.time_type;
    const food_code = purchase.food_code;
    const order_code = purchase.order_code;
    const phone_number = purchase.phone_number;
    const receipt_email = purchase.receipt_email;
    const receipt_url = purchase.receipt_url;
    const fingerprint = purchase.fingerprint;
    try {
      const returning = await db("purchases")
        .insert({
          user_id,
          profile_img_url,
          first_name,
          last_name,
          food_img_url,
          quantity,
          description,
          cost,
          ready_time,
          time_type,
          food_code,
          order_code,
          phone_number,
          receipt_email,
          receipt_url,
          fingerprint
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getUserPurchase: async user_id => {
    try {
      const returning = await db("purchases").where("user_id", user_id);
      return { success: true, purchases: returning };
    } catch (err) {
      return { success: false, message: "No purchase(s) found." };
    }
  },
  getAllPurchase: async () => {
    try {
      const returning = await db("purchases");
      return { success: true, purchases: returning };
    } catch (err) {
      return { success: false, message: "No purchase(s) found." };
    }
  },
  updatePurchase: async (purchase, id) => {
    const user_id = purchase.user_id;
    const quantity = purchase.quantity;
    const description = purchase.description;
    const food_code = purchase.food_code;
    const receipt_email = purchase.receipt_email;
    const accept = purchase.accept;
    const reject_note = purchase.reject_note;

    try {
      const returning = await db("purchases")
        .where("id", id)
        .update({
          user_id,
          accept,
          reject_note
        })
        .returning("*");

      if (accept) {
        jwt.sign(
          { purchase: returning[0].user_id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "1d"
          },
          async () => {
            try {
              // Convert food code to QR code
              let foodQrCode = await qrCode.toString(food_code);

              // Async food coupon email
              await Mailer.transporter.sendMail({
                from: "noreply@kodede.com",
                to: receipt_email,
                subject: `[Kodede] Your coupon for ${quantity} ${description}`,
                html:  `<div>
                          Please present this QR Code at the time of payment to redeem your ${description}.<br><br>
                        </div>
                        <div>
                          Offer expires within 24 hours from receiving this coupon.<br><br>
                        </div>
                        <div style="width: 200px; height: 200px;">${foodQrCode}</div>
                        <div>${food_code}<br><br></div>
                        <div>
                          Sent with <3 from Kodede (Powered by Tasttlig).<br><br>
                        </div>
                        <div>Tasttlig Corporation</div>
                        <div>585 Dundas Street East, 3rd Floor</div>
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
