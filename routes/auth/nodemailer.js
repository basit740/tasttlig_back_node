"use strict";

// Libraries
const nodemailer = require("nodemailer");
const aws = require("aws-sdk");

var mailConfig;

if (process.env.NODE_ENV === "production") {
  mailConfig = {
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD
    }
  };
  // mailConfig = {
  //   SES: new aws.SES({
  //       apiVersion: '2010-12-01'
  //   })
  // };
} else if (process.env.NODE_ENV == "test") {
  // use ethereal mail in testing environment
  // https://ethereal.email/
  mailConfig = {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "keara.block@ethereal.email",
      pass: "hbGChvzjwgRwWUeewC"
    }
  };
} else {
  // use papercut in development
  // https://github.com/ChangemakerStudios/Papercut-SMTP
  mailConfig = {
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD
    }
  };
}

module.exports = {
  transporter: nodemailer.createTransport(mailConfig)
};
