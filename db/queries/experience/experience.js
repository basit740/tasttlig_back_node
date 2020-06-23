"use strict";

// Experiences table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

// Export experiences table
module.exports = {
  getAllExperiences: async () => {
    try {
      const returning = await db("experiences");
      return { success: true, experiences: returning };
    } catch (err) {
      return { success: false, message: "No experience found." };
    }
  },
  getUserExperiences: async user_id => {
    try {
      const returning = await db("experiences").where("user_id", user_id);
      return { success: true, experiences: returning };
    } catch (err) {
      return { success: false, message: "No experience found." };
    }
  },
  createExperience: async (experience, user_id) => {
    const img_url_1 = experience.img_url_1;
    // const img_url_2 = experience.img_url_2;
    // const img_url_3 = experience.img_url_3;
    const title = experience.title;
    const price = experience.price;
    const category = experience.category;
    const style = experience.style;
    const start_date = experience.start_date;
    const end_date = experience.end_date;
    const start_time = experience.start_time;
    const end_time = experience.end_time;
    const capacity = experience.capacity;
    const dress_code = experience.dress_code;
    const address_line_1 = experience.address_line_1;
    const address_line_2 = experience.address_line_2;
    const city = experience.city;
    const province_territory = experience.province_territory;
    const postal_code = experience.postal_code;
    const description = experience.description;
    const first_name = experience.first_name;
    const last_name = experience.last_name;
    const email = experience.email;
    const phone_number = experience.phone_number;
    try {
      const returning = await db("experiences")
        .insert({
          user_id,
          img_url_1,
          title,
          price,
          category,
          style,
          start_date,
          end_date,
          start_time,
          end_time,
          capacity,
          dress_code,
          address_line_1,
          address_line_2,
          city,
          province_territory,
          postal_code,
          description,
          first_name,
          last_name,
          email,
          phone_number
        })
        .returning("*");
      if (returning) {
        jwt.sign(
          { experience: returning[0].user_id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "15m"
          },
          async () => {
            try {
              // Async create an experience confirmation email
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.TASTTLIG_ADMIN_EMAIL,
                subject: `[Tasttlig] Thank you for creating your experience`,
                html:  `<div>
                          Hello ${first_name} ${last_name},<br><br>
                        </div>
                        <div>
                          Thank you for creating your experience! Our team will 
                          review it and publish within 24 hours if there is no 
                          more information required.
                          <br><br>
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
      return { success: true, experience: returning[0] };
    } catch (err) {
      return { success: false, data: err };
    }
  },
  updateExperience: async (experience, id) => {
    const title = experience.title;
    const first_name = experience.first_name;
    const last_name = experience.last_name;
    const email = experience.email;
    const accepted = experience.accepted;
    const reject_note = experience.reject_note;
    try {
      const returning = await db("experiences")
        .where("id", id)
        .update({ title, first_name, last_name, email, accepted, reject_note })
        .returning("*");
      if (returning && accepted) {
        jwt.sign(
          { experience: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "15m"
          },
          async () => {
            try {
              // Async experience accepted email
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.TASTTLIG_ADMIN_EMAIL,
                subject: `[Tasttlig] Your experience "${title}" is accepted`,
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
                        <div>
                          Your experience "${title}" is accepted from Tasttlig.
                          <br><br>
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
      } else if (returning && reject_note) {
        jwt.sign(
          { experience: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "15m"
          },
          async () => {
            try {
              // Async experience rejected email
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.TASTTLIG_ADMIN_EMAIL,
                subject: `[Tasttlig] Your experience "${title}" is rejected`,
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
                        <div>
                          We regret to inform you that your experience "${title}" is rejected from Tasttlig. Please see the reason below. If you wish to create another experience, consider the feedback shared for the next time.<br><br>
                        </div>
                        <div>
                          Reject Reason: ${reject_note}<br><br>
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
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  deleteExperience: async id => {
    try {
      const returning = await db("experiences")
        .where("id", id)
        .del();
      if (returning) {
        return {
          success: true,
          message: "Experience has been deleted."
        };
      }
    } catch (err) {
      return { success: false, data: err };
    }
  }
};
