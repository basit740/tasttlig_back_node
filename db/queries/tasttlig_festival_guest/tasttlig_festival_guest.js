"use strict";

// Tasttlig Festival guests table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

// Export Tasttlig Festival guests table
module.exports = {
  getAllTasttligFestivalGuest: async () => {
    try {
      const returning = await db("tasttlig_festival_guests");
      return { success: true, tasttligFestivalGuests: returning };
    } catch (err) {
      return { success: false, message: "No Tasttlig Festival guest found." };
    }
  },
  createTasttligFestivalGuest: async (tasttligFestivalGuest, user_id) => {
    const first_name = tasttligFestivalGuest.first_name;
    const last_name = tasttligFestivalGuest.last_name;
    const email = tasttligFestivalGuest.email;
    const phone_number = tasttligFestivalGuest.phone_number;
    try {
      const returning = await db("tasttlig_festival_guests")
        .insert({
          user_id,
          first_name,
          last_name,
          email,
          phone_number
        })
        .returning("*");
      if (returning) {
        jwt.sign(
          { tasttligFestivalGuest: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "7d"
          },
          async () => {
            try {
              // Async Tasttlig Festival RSVP email
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.TASTTLIG_ADMIN_EMAIL,
                subject: `[Tasttlig] Congratulations! You are attending Tasttlig 2020`,
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
                        <div>
                          We are so glad you can join us at our premier Multi-National Food Festival in Toronto. We are expecting food from over 100 countries with lots of entertainment, including music, art, and games. The festival’s objective is to connect you to food from all around the world. All of our participating restaurants are happy to provide you free samples of their food, in addition to the 3-course culinary experience. To get access to the festival, kindly click this link to download your passport.<br><br>
                        </div>
                        <div>
                          <a 
                            href="https://tasttlig.com/passport"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download Passport
                          </a><br><br>
                        </div>
                        <div>
                          We look forward to hosting you at Tasttlig 2020!<br><br>
                        </div>
                        <div>Sincerely,<br><br></div>
                        <div>Tasttlig Team<br><br></div>
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
