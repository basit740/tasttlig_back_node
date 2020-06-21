"use strict";

// Libraries
const nodemailer = require("nodemailer");

var mailConfig;

if (process.env.NODE_ENV === 'production' ){
    mailConfig = {
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    };
} else if (process.env.NODE_ENV == 'test') {
    // use ethereal mail in testing environment
    // https://ethereal.email/
    mailConfig = {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'keara.block@ethereal.email',
        pass: 'hbGChvzjwgRwWUeewC'
      }
    }
} else {
    // use papercut in development
    // https://github.com/ChangemakerStudios/Papercut-SMTP
    mailConfig = {
        host: 'localhost',
        port: 25,
        auth: {
            user: 'user',
            pass: 'pass'
        }
    };
}

module.exports = {
  transporter: nodemailer.createTransport(mailConfig)
};
