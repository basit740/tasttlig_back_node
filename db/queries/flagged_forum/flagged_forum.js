"use strict";

// Flagged Forum table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

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
    const reply = flaggedForum.reply;
    const archive = flaggedForum.archive;
    try {
      const returning = await db("flagged_forums")
        .where("id", id)
        .update({ reply, archive })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  }
};
