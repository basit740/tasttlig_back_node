"use strict";

// Tasttlig Festival message table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

// Export Tasttlig Festival message table
module.exports = {
  createTasttligMessage: async tasttligMessage => {
    const name = tasttligMessage.name;
    const email = tasttligMessage.email;
    const phone_number = tasttligMessage.phone_number;
    const message = tasttligMessage.message;
    try {
      const returning = await db("tasttlig_messages")
        .insert({
          name,
          email,
          phone_number,
          message
        })
        .returning("*");
      if (returning) {
        jwt.sign(
          { message: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "28d"
          },
          async () => {
            try {
              // Async incoming Tasttlig Festival message email
              await Mailer.transporter.sendMail({
                to: process.env.TASTTLIG_FESTIVAL_ADMIN_EMAIL,
                subject: `[Tasttlig Festival] Incoming message from ${name}`,
                html:  `<div>Hello Tasttlig Festival,<br><br></div>
                        <div>
                          There is an incoming message from ${name}.<br><br>
                        </div>
                        <div>
                          Phone: ${phone_number}<br>
                          Email: ${email}<br><br>
                        </div>
                        <div>Please see below.<br><br></div>
                        <div>${message}<br><br></div>
                        <div>
                          Sent with <3 from Tasttlig Festival (Created By Tasttlig).<br><br>
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
