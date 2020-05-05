"use strict";

// Feedback table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

// Export feedback table
module.exports = {
  getAllFeedback: async () => {
    try {
      const returning = await db("feedbacks").where("remove", false);
      return { success: true, feedbacks: returning };
    } catch (err) {
      return { success: false, message: "No feedback found." };
    }
  },
  createFeedback: async (feedback, user_id) => {
    const food_ad_id = feedback.food_ad_id;
    const body = feedback.body;
    const profile_img_url = feedback.profile_img_url;
    const feedback_email = feedback.feedback_email;
    const feedback_first_name = feedback.feedback_first_name;
    const feedback_last_name = feedback.feedback_last_name;
    const food_ad_email = feedback.food_ad_email;
    const food_ad_first_name = feedback.food_ad_first_name;
    const food_ad_last_name = feedback.food_ad_last_name;
    const food_ad_name = feedback.food_ad_name;
    const rating = feedback.rating;
    try {
      const returning = await db("feedbacks")
        .insert({
          user_id,
          food_ad_id,
          body,
          profile_img_url,
          feedback_email,
          feedback_first_name,
          feedback_last_name,
          food_ad_email,
          food_ad_first_name,
          food_ad_last_name,
          food_ad_name,
          rating
        })
        .returning("*");
        if (returning) {
          jwt.sign(
            { feedback: returning[0].user_id },
            process.env.EMAIL_SECRET,
            {
              expiresIn: "1d"
            },
            async () => {
              try {
                // Async food ad feedback email
                const mail_list_claimed = [
                  process.env.KODEDE_ADMIN_EMAIL,
                  feedback_email
                ];
                await Mailer.transporter.sendMail({
                  to: food_ad_email,
                  bcc: mail_list_claimed,
                  subject: `[Kodede] Your feedback for ${food_ad_name}`,
                  html:  `<div>
                            Hello ${food_ad_first_name} ${food_ad_last_name},<br><br>
                          </div>
                          <div>
                            Here is your feedback from ${feedback_first_name} ${feedback_last_name} on ${food_ad_name}.<br><br>
                          </div>
                          <div>"${body}"<br><br></div>
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
      return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  updateFeedback: async (feedback, id) => {
    const remove = feedback.remove;
    try {
      const returning = await db("feedbacks")
        .where("id", id)
        .update({ remove })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  }
};
