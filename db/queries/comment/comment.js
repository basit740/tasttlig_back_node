"use strict";

// Forum comment table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export forum comment table
module.exports = {
  createComment: async (comment, user_id) => {
    const post_id = comment.post_id;
    const profile_img_url = comment.profile_img_url;
    const first_name = comment.first_name;
    const last_name = comment.last_name;
    const body = comment.body;
    try {
      const returning = await db("comments")
        .insert({
          user_id,
          post_id,
          profile_img_url,
          first_name,
          last_name,
          body
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getAllComment: async () => {
    try {
      const returning = await db("comments");
      return { success: true, comments: returning };
    } catch (err) {
      return { success: false, message: "No forum comment found." };
    }
  }
};
