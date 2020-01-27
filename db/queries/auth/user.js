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
      // if (returning) return (response = { success: true, user: returning[0] });
      // console.log("returning", returning);
      jwt.sign(
        { user: returning[0].id },
        process.env.EMAIL_SECRET,
        {
          expiresIn: "1d"
        },
        async (err, emailToken) => {
          try {
            const url = `http://localhost:4000/confirmation/${emailToken}`;
            const info = await Mailer.transporter.sendMail({
              to: email,
              subject: "Confirm Email",
              html: `${url}`
            });
            console.log(info);
          } catch (err) {
            console.log("mail err", err);
          }
        }
      );
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getUserLogin: async email => {
    try {
      const returning = await db("users")
        .where("email", email)
        .first();
      if (returning) {
        return (response = { success: true, user: returning });
      } else {
        return (response = { success: false, message: "User not found" });
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
      return (response = { success: true, user: returning });
    } catch (err) {
      return (response = { success: false, message: "No user found" });
    }
  }
};
