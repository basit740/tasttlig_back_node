"use strict";

// Tasttlig newsletter table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

// Export Tasttlig newsletter table
module.exports = {
  getAllTasttligNewsletter: async () => {
    try {
      const returning = await db("tasttlig_newsletters");
      return { success: true, tasttligNewsletters: returning };
    } catch (err) {
      return { success: false, message: "No Tasttlig newsletter found." };
    }
  },
  createTasttligNewsletter: async tasttligNewsletter => {
    const email = tasttligNewsletter.email;
    try {
      const returning = await db("tasttlig_newsletters")
        .insert({ email })
        .returning("*");
      if (returning) {
        jwt.sign(
          { tasttligNewsletter: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "1d"
          },
          async () => {
            try {
              // Async Tasttlig newsletter confirmation email
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.TASTTLIG_ADMIN_EMAIL,
                subject: `[Tasttlig] Thank you for subscribing to our newsletter`,
                html:  `<div>Hello,<br><br></div>
                        <div>
                          We are so glad you can subscribe to our newsletter! 
                          You can now get news on the latest experiences by 
                          Tasttlig.<br><br>
                        </div>
                        <div>Sincerely,<br><br></div>
                        <div>Tasttlig Team<br><br></div>
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
      return (response = { success: true });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  }
};
