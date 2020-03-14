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
    const user_postal_code = user.user_postal_code;
    const postal_code_type = user.postal_code_type;
    const food_handler_certificate = user.food_handler_certificate;
    const date_of_issue = user.date_of_issue;
    const expiry_date = user.expiry_date;
    const commercial_kitchen = user.commercial_kitchen;

    try {
      const returning = await db("users")
        .insert({
          first_name,
          last_name,
          email,
          password_digest,
          phone_number,
          user_postal_code,
          postal_code_type,
          food_handler_certificate,
          date_of_issue,
          expiry_date,
          commercial_kitchen
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
            const url = `http://localhost:3000/user/verify/${emailToken}`;
            const info = await Mailer.transporter.sendMail({
              to: email,
              subject: "Confirm Email",
              html: `<a href="${url}">Please click here and verify your email address</a>`
            });
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
  updateProfile: async user => {
    const id = user.id;
    const first_name = user.first_name;
    const last_name = user.last_name;
    const email = user.email;
    const password_digest = user.password;
    const phone_number = user.phone_number;
    const user_postal_code = user.user_postal_code;
    const postal_code_type = user.postal_code_type;
    const food_handler_certificate = user.food_handler_certificate;
    const date_of_issue = user.date_of_issue;
    const expiry_date = user.expiry_date;
    const commercial_kitchen = user.commercial_kitchen;
    const profile_img_url = user.profile_img_url;
    const chef = user.chef;
    const caterer = user.caterer;
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
          user_postal_code,
          postal_code_type,
          food_handler_certificate,
          date_of_issue,
          expiry_date,
          commercial_kitchen,
          profile_img_url,
          chef,
          caterer,
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
  }
};
