"use strict";
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

module.exports = {
  userRegister: async user => {
    const email = user.email;
    const password = user.password;
    const first_name = user.first_name;
    const last_name = user.last_name;
    const phone_number = user.phone_number;
    const role = user.role;
    const isHost = user.isHost;
    try {
      const returning = await db("users")
        .insert({
          email,
          password,
          first_name,
          last_name,
          phone_number,
          role,
          isHost
        })
        .returning("*");
      jwt.sign(
        { user: returning[0].id },
        process.env.EMAIL_SECRET,
        {
          expiresIn: "1d"
        },
        async (err, emailToken) => {
          try {
            const url = `http://localhost:4000/user/verify/${emailToken}`; //TODO:TRY THIS
            const info = await Mailer.transporter.sendMail({
              to: email,
              subject: "Confirm Email",
              html: `<a href="${url}">Please click here and verify your email address</a>`
            });
            console.log("mailer info", info);
          } catch (err) {
            console.log("mail err", err);
          }
        }
      );
      if (returning) {
        return { success: true, data: returning[0] };
      }
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
  updatePassword: async (email, password) => {
    try {
      const returning = await db("users")
        .where("email", email)
        .update("password", password)
        .returning("*");
      console.log("updatePassword", returning);
      return { success: true, message: "ok", data: returning };
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
        return { success: false, message: "User not found" };
      }
    } catch (err) {
      console.log(err);
      return { success: false, data: err };
    }
  },
  getUserLogOut: async user_id => {
    try {
      const returning = await db("refreshtokens")
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
      const returning = await db("users")
        .where("email", email)
        .first();
      if (returning) {
        return { success: true, user: returning };
      } else {
        return { success: false, message: "User not found" };
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
      return { success: false, message: "No user found" };
    }
  }
};
