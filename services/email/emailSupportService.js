"use strict";

// Libraries
const Mailer = require("./nodemailer").nodemailer_transporter;

const emailSupportService = async (data) => {
  try {
    let adminEmail = "";
    if (process.env.NODE_ENV === "production") {
      adminEmail = "admin@tasttlig.com";
    } else if (process.env.NODE_ENV === "staging") {
      adminEmail = "keara.block@ethereal.email";
    } else {
      adminEmail = process.env.GMAIL_USER;
    }

    await Mailer.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: adminEmail,
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
