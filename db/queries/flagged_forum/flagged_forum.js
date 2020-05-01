"use strict";

// Flagged Forum table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const jwt = require("jsonwebtoken");
const Mailer = require("../../../routes/auth/nodemailer");

// Export flagged forum table
module.exports = {
  getAllFlaggedForum: async () => {
    try {
      const returning = await db("flagged_forums").where("archive", false);
      return { success: true, flaggedForums: returning };
    } catch (err) {
      return { success: false, message: "No flagged forum found." };
    }
  },
  getAllArchivedFlaggedForum: async () => {
    try {
      const returning = await db("flagged_forums").where("archive", true);
      return { success: true, flaggedForums: returning };
    } catch (err) {
      return { success: false, message: "No archived flagged forum found." };
    }
  },
  createFlaggedForum: async (flaggedForum, user_id) => {
    const post_id = flaggedForum.post_id;
    const flagged_email = flaggedForum.flagged_email;
    const flagged_profile_img_url = flaggedForum.flagged_profile_img_url;
    const flagged_first_name = flaggedForum.flagged_first_name;
    const flagged_body = flaggedForum.flagged_body;
    const post_profile_img_url = flaggedForum.post_profile_img_url;
    const post_first_name = flaggedForum.post_first_name;
    const post_title = flaggedForum.post_title;
    const post_body = flaggedForum.post_body;
    const post_img_url = flaggedForum.post_img_url;
    try {
      const returning = await db("flagged_forums")
        .insert({
          user_id,
          post_id,
          flagged_email,
          flagged_profile_img_url,
          flagged_first_name,
          flagged_body,
          post_profile_img_url,
          post_first_name,
          post_title,
          post_body,
          post_img_url
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  updateFlaggedForum: async (flaggedForum, id) => {
    const flagged_email = flaggedForum.flagged_email;
    const flagged_first_name = flaggedForum.flagged_first_name;
    const flagged_body = flaggedForum.flagged_body;
    const post_title = flaggedForum.post_title;
    const reply = flaggedForum.reply;
    const archive = flaggedForum.archive;
    try {
      const returning = await db("flagged_forums")
        .where("id", id)
        .update({ reply, archive })
        .returning("*");
      if (returning) {
        jwt.sign(
          { flaggedForum: returning[0].id },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "1d"
          },
          async () => {
            try {
              // Async flagged forum post response from admin email
              await Mailer.transporter.sendMail({
                to: flagged_email,
                bcc: process.env.KODEDE_ADMIN_EMAIL,
                subject: `[Kodede] Your flagged forum post for ${post_title}`,
                html:  `<div>Hello ${flagged_first_name},<br><br></div>
                        <div>
                          You have recently flagged a forum post. Your response was: ${flagged_body}<br><br>
                        </div>
                        <div>${reply}<br><br></div>
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
