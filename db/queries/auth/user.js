"use strict";

// Users table configuration and libraries
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

// Exports users table
module.exports = {
  userRegister: async user => {
    const first_name = user.first_name;
    const last_name = user.last_name;
    const email = user.email;
    const password_digest = user.password;
    const phone_number = user.phone_number;
    const food_handler_certificate = user.food_handler_certificate;
    const date_of_issue = user.date_of_issue;
    const expiry_date = user.expiry_date;
    try {
      const returning = await db("users")
        .insert({
          first_name,
          last_name,
          email,
          password_digest,
          phone_number,
          food_handler_certificate,
          date_of_issue,
          expiry_date
        })
        .returning("*");
      if (returning) {
        jwt.sign(
          { user: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "1d"
          },
          // Async email verification email
          async (err, emailToken) => {
            try {
              const urlVerifyEmail = `http://localhost:3000/user/verify/${emailToken}`;
              const urlCommercial = `http://localhost:3000/become-commercial-member`;
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.KODEDE_ADMIN_EMAIL,
                subject: "[Kodede] Please verify your email",
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
                        <div>
                          Welcome to Kodede!<br><br>
                        </div>
                        <div>
                          Kodede connects you to food from all around the world. Kindly verify your email so you can begin trying food from anywhere.<br><br>
                        </div>
                        <div>
                          <a href="${urlVerifyEmail}">Verify Email</a><br><br>
                        </div>
                        <div>
                          If you are able to sell food, Kodede provides you a commercial profile to make it easier to sell your food from all over the world. Click on this link to bring your food to market.<br><br>
                        </div>
                        <div>
                          <a href="${urlCommercial}">Get Started</a><br><br>
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
      return { success: true, data: returning[0] };
    } catch (err) {
      return { success: false, data: err };
    }
  },
  verifyAccount: async user_id => {
    try {
      const returning = await db("users")
        .where("id", user_id)
        .update("verified", true);
      return { success: true, message: "ok", user_id: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  updateProfile: async user => {
    const id = user.id;
    const first_name = user.first_name;
    const last_name = user.last_name;
    const email = user.email;
    const password_digest = user.password;
    const phone_number = user.phone_number;
    const food_handler_certificate = user.food_handler_certificate;
    const date_of_issue = user.date_of_issue;
    const expiry_date = user.expiry_date;
    const certified = user.certified;
    const profile_img_url = user.profile_img_url;
    const business_street_address = user.business_street_address;
    const business_city = user.business_city;
    const business_province_territory = user.business_province_territory;
    const business_postal_code = user.business_postal_code;
    const facebook = user.facebook;
    const twitter = user.twitter;
    const instagram = user.instagram;
    const youtube = user.youtube;
    const linkedin = user.linkedin;
    const website = user.website;
    const bio = user.bio;
    try {
      const returning = await db("users")
        .where("id", id)
        .update({
          first_name,
          last_name,
          email,
          password_digest,
          phone_number,
          food_handler_certificate,
          date_of_issue,
          expiry_date,
          certified,
          profile_img_url,
          business_street_address,
          business_city,
          business_province_territory,
          business_postal_code,
          facebook,
          twitter,
          instagram,
          youtube,
          linkedin,
          website,
          bio
        })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  updatePassword: async (email, password) => {
    try {
      const returning = await db("users")
        .where("email", email)
        .update("password_digest", password)
        .returning("*");
      if (returning) {
        jwt.sign(
          { user: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "15m"
          },
          // Async password change confirmation email
          async () => {
            try {
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.KODEDE_ADMIN_EMAIL,
                subject: "[Kodede] Password changed",
                html:  `<div>Hello,<br><br></div>
                        <div>
                          The password for your Kodede account was recently changed. If so, please disregard this email. If not, review your account now.<br><br>
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
      return { success: true, message: "ok", data: returning[0] };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  getUserLogin: async email => {
    try {
      const returning = await db("users")
        .where("email", email)
        .first();
      if (returning) {
        return { success: true, user: returning };
      } else {
        return { success: false, message: "User not found." };
      }
    } catch (err) {
      console.log(err);
      return { success: false, data: err };
    }
  },
  getUserLogOut: async user_id => {
    try {
      const returning = await db("refresh_tokens")
        .del()
        .where("user_id", user_id);
      if (returning === user_id) {
        return {
          success: true,
          message: "User logged out, refresh token deleted."
        };
      }
    } catch (err) {
      return { success: false, data: err };
    }
  },
  checkEmail: async email => {
    try {
      const returning = await db("users")
        .where("email", email)
        .first();
      if (returning) {
        return { success: true, user: returning };
      } else {
        return { success: false, message: "User not found." };
      }
    } catch (err) {
      console.log(err);
      return { success: false, data: err };
    }
  },
  getUserById: async id => {
    try {
      const returning = await db("users")
        .where("id", id)
        .first();
      return { success: true, user: returning };
    } catch (err) {
      return { success: false, message: "No user found." };
    }
  },
  getAllUser: async () => {
    try {
      const returning = await db("users");
      return { success: true, users: returning };
    } catch (err) {
      return { success: false, message: "No user found." };
    }
  },
  updateUser: async (user, id) => {
    const first_name = user.first_name;
    const last_name = user.last_name;
    const email = user.email;
    const certified = user.certified;
    const reject_note = user.reject_note;
    try {
      const returning = await db("users")
        .where("id", id)
        .update({ first_name, last_name, email, certified, reject_note })
        .returning("*");
      if (returning && certified) {
        jwt.sign(
          { user: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "15m"
          },
          async () => {
            try {
              // Async food advertiser application accepted email
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.KODEDE_ADMIN_EMAIL,
                subject: `[Kodede] Your application as food advertiser is accepted`,
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
                        <div>
                          Congratulations! Your application as food advertiser is accepted from Kodede. You can now publish ads for people to taste food from around the world.<br><br>
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
          { user: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "15m"
          },
          async () => {
            try {
              // Async food advertiser application rejected email
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.KODEDE_ADMIN_EMAIL,
                subject: `[Kodede] Your application as food advertiser is rejected`,
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
                        <div>
                          We regret to inform you that your application as food advertiser is rejected from Kodede. Please see the reason below. If you wish to apply again, consider the feedback shared for the next time.<br><br>
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
  },
  messageFoodAdvertisers: async (user) => {
    const emails = user.emails;
    const subject = user.subject;
    const message = user.message;
    try {
      const returning = await db("users")
        .where("certified", true)
        .update({ subject, message })
        .returning("*");
      if (returning) {
        jwt.sign(
          { user: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "1d"
          },
          async () => {
            try {
              // Async message to food advertisers from admin email
              await Mailer.transporter.sendMail({
                to: emails,
                bcc: process.env.KODEDE_ADMIN_EMAIL,
                subject: `[Kodede] ${subject}`,
                html:  `<div>Hello,<br><br></div>
                        <div>${message}<br><br></div>
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
