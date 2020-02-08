"use strict";

// Libraries
const nodemailer = require("nodemailer");

module.exports = {
  transporter: nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD
    }
  })
};
