"use strict";

// Libraries
const Mailer = require("./nodemailer").nodemailer_transporter;

const emailSupportService = async (data) => {
  try {
    let adminEmail = "admin@tasttlig.com";
    if (process.env.NODE_ENV === "production") {
      adminEmail = "admin@tasttlig.com";
    } else if (process.env.NODE_ENV === "staging") {
      adminEmail = "admin@tasttlig.com";
    } else {
      adminEmail = process.env.GMAIL_USER;
    }

    const send = await Mailer.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: adminEmail,
      bcc: data.email,
      subject: "[Tasttlig] Host Support Service",
      template: "email_support",
      context: {
        title: "[Tasttlig] Host Support Service",
        email: data.email + "",
        first_name: data.first_name + "",
        last_name: data.last_name + "",
        message: data.message + "",
      },
    });
    if (send.accepted.length > 0) {
      return { success: true, message: send };
    } else {
      return { success: false, message: send };
    }
  } catch (error) {
    console.log("error", error);
    return { success: false, error: error };
  }
};

module.exports = {
  emailSupportService,
};
