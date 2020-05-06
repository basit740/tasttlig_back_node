"use strict";

// Flagged Feedback table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

// Export flagged feedback table
module.exports = {
  getAllFlaggedFeedback: async () => {
    try {
      const returning = await db("flagged_feedbacks").where("archive", false);
      return { success: true, flaggedFeedbacks: returning };
    } catch (err) {
      return { success: false, message: "No flagged feedback found." };
    }
  },
  getAllArchivedFlaggedFeedback: async () => {
    try {
      const returning = await db("flagged_feedbacks").where("archive", true);
      return { success: true, flaggedFeedbacks: returning };
    } catch (err) {
      return { success: false, message: "No archived flagged feedback found." };
    }
  },
  createFlaggedFeedback: async (flaggedFeedback, user_id) => {
    const food_ad_id = flaggedFeedback.food_ad_id;
    const feedback_id = flaggedFeedback.feedback_id;
    const flagged_email = flaggedFeedback.flagged_email;
    const flagged_profile_img_url = flaggedFeedback.flagged_profile_img_url;
    const flagged_first_name = flaggedFeedback.flagged_first_name;
    const flagged_body = flaggedFeedback.flagged_body;
    const feedback_body = flaggedFeedback.feedback_body;
    const feedback_profile_img_url = flaggedFeedback.feedback_profile_img_url;
    const feedback_first_name = flaggedFeedback.feedback_first_name;
    try {
      const returning = await db("flagged_feedbacks")
        .insert({
          user_id,
          food_ad_id,
          feedback_id,
          flagged_email,
          flagged_profile_img_url,
          flagged_first_name,
          flagged_body,
          feedback_body,
          feedback_profile_img_url,
          feedback_first_name
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  updateFlaggedFeedback: async (flaggedFeedback, id) => {
    const flagged_email = flaggedFeedback.flagged_email;
    const flagged_first_name = flaggedFeedback.flagged_first_name;
    const flagged_body = flaggedFeedback.flagged_body;
    const feedback_body = flaggedFeedback.feedback_body;
    const reply = flaggedFeedback.reply;
    const archive = flaggedFeedback.archive;
    try {
      const returning = await db("flagged_feedbacks")
        .where("id", id)
        .update({ reply, archive })
        .returning("*");
      if (returning) {
        jwt.sign(
          { flaggedFeedback: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "1d"
          },
          async () => {
            try {
              // Async flagged feedback response from admin email
              await Mailer.transporter.sendMail({
                to: flagged_email,
                bcc: process.env.KODEDE_ADMIN_EMAIL,
                subject: `[Kodede] Your flagged feedback for "${feedback_body}"`,
                html:  `<div>Hello ${flagged_first_name},<br><br></div>
                        <div>
                          You have recently flagged a food ad feedback. Your response was: ${flagged_body}<br><br>
                        </div>
                        <div>${reply}<br><br></div>
                        <div>
                          Thank you for bringing this food ad feedback to our attention.<br><br>
                        </div>
                        <div>
                          Sent with <3 from Kodede (Created By Tasttlig).<br><br>
                        </div>
                        <div>Tasttlig Corporation</div>
                        <div>585 Dundas St E, 3rd Floor</div>
                        <div>Toronto, ON M5A 2B7, Canada</div>`
              });
            } catch (err) {
              console.log(err);
            }
          }
        );
      }
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  }
};
