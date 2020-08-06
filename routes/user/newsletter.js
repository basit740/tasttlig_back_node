"use strict";

const router = require('express').Router();
const Mailer = require("../../services/email/nodemailer").nodemailer_transporter;
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

router.post("/tasttlig-newsletters", async (req, res) => {
  if (!req.body.email) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try{
    // Email to user on submitting the request to upgrade
    await Mailer.sendMail({
      to: ADMIN_EMAIL,
      subject: `[Tasttlig] Newsletter request`,
      template: 'newsletter_admin',
      context: {
        email: req.body.email
      }
    });
    res.send({
      success: true,
      message: "subscribe successful"
    });
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err.message
    });
  }
});

module.exports = router;