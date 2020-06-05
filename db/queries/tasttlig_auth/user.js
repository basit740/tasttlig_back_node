"use strict";

// Libraries
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/tasttligAuth/nodemailer");

module.exports = {
  userRegister: async user => {
    const first_name = user.first_name;
    const last_name = user.last_name;
    const email = user.email;
    const password_digest = user.password;
    const phone_number = user.phone_number;
    try {
      const returning = await db("tasttlig_users")
        .insert({
          first_name,
          last_name,
          email,
          password_digest,
          phone_number
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
              const urlVerifyEmail = `http://localhost:3000/tasttlig/user/verify/${emailToken}`;
              await Mailer.transporter.sendMail({
                to: email,
                bcc: process.env.TASTTLIG_FESTIVAL_ADMIN_EMAIL,
                subject: "[Tasttlig Festival] Welcome to Tasttlig Festival!",
                html:  `<div>Hello ${first_name} ${last_name},<br><br></div>
                        <div>
                          We are so glad you joined us!<br><br>
                        </div>
                        <div>
                          Please kindly verify your email so you can begin trying food experiences from the festival.<br><br>
                        </div>
                        <div>
                          <a href="${urlVerifyEmail}">Verify Email</a><br><br>
                        </div>
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
      return { success: true, data: returning[0] };
    } catch (err) {
      return { success: false, data: err };
    }
  },
  verifyAccount: async user_id => {
    try {
      const returning = await db("tasttlig_users")
        .where("id", user_id)
        .update("verified", true);
      return { success: true, message: "ok", user_id: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  updatePassword: async (email, password) => {
    try {
      const returning = await db("tasttlig_users")
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
                bcc: process.env.TASTTLIG_FESTIVAL_ADMIN_EMAIL,
                subject: "[Tasttlig Festival] Password changed",
                html:  `<div>Hello,<br><br></div>
                        <div>
                          The password for your Tasttlig Festival account was recently changed. If so, please disregard this email. If not, review your account now.<br><br>
                        </div>
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
      return { success: true, message: "ok", data: returning[0] };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  getUserLogin: async email => {
    try {
      const returning = await db("tasttlig_users")
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
      const returning = await db("tasttlig_refresh_tokens")
        .del()
        .where("user_id", user_id);
      if (returning === user_id) {
        return {
          success: true,
          message: "User logged out, refresh token deleted"
        };
      }
    } catch (err) {
      return { success: false, data: err };
    }
  },
  checkEmail: async email => {
    try {
      const returning = await db("tasttlig_users")
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
      const returning = await db("tasttlig_users")
        .where("id", id)
        .first();
      return { success: true, user: returning };
    } catch (err) {
      return { success: false, message: "No user found" };
    }
  }
};
