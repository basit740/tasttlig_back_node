"use strict";

// Libraries
const nodemailer = require("nodemailer");
const aws = require("aws-sdk");
const hbs = require("nodemailer-express-handlebars");
const current_file_path = require("path").dirname(__filename);

aws.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

let mailConfig;

if (process.env.NODE_ENV === "production") {
  mailConfig = {
    SES: new aws.SES({
      apiVersion: "2010-12-01",
    }),
  };
} else if (process.env.NODE_ENV === "staging") {
  // Use Ethereal mail in testing environment
  // https://ethereal.email/
  mailConfig = {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "keara.block@ethereal.email",
      pass: "hbGChvzjwgRwWUeewC",
    },
  };
} else {
  mailConfig = {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "keara.block@ethereal.email",
      pass: "hbGChvzjwgRwWUeewC",
    },
  };
}

let options = {
  viewEngine: {
    extname: ".hbs",
    layoutsDir: current_file_path + "../../../public/emails/",
    defaultLayout: "main",
    partialsDir: current_file_path + "../../../public/emails/partials/",
  },
  viewPath: current_file_path + "../../../public/emails/",
  extName: ".hbs",
};

let nodemailer_transporter = nodemailer.createTransport(mailConfig);
// Attach the plug-in to the Nodemailer transporter
nodemailer_transporter.use("compile", hbs(options));

const emailSupportService = async (data) => {
  try {
    let adminEmail = "";
    if (process.env.NODE_ENV === "production") {
      adminEmail = "admin@tasttlig.com";
    } else if (process.env.NODE_ENV === "staging") {
      adminEmail = process.env.GMAIL_USER;
    } else {
      adminEmail = process.env.GMAIL_USER;
    }

    await nodemailer_transporter.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: adminEmail + "",
      bcc: process.env.TASTTLIG_ADMIN_EMAIL,
      subject: `[Tasttlig] Support Service`,
      template: "email_support",
      context: {
        email: data.email + "",
        first_name: data.first_name + "",
        last_name: data.last_name + "",
        message: data.message + "",
      },
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: e };
  }
};

module.exports = {
  emailSupportService,
};
