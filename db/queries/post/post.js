"use strict";

// Forum post table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export forum post table
module.exports = {
  createPost: async (post, user_id) => {
    const profile_img_url = post.profile_img_url;
    const first_name = post.first_name;
    const last_name = post.last_name;
    const title = post.title;
    const body = post.body;
    try {
      const returning = await db("posts")
        .insert({
          user_id,
          profile_img_url,
          first_name,
          last_name,
          title,
          body
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getAllPost: async () => {
    try {
      const returning = await db("posts");
      return { success: true, posts: returning };
    } catch (err) {
      return { success: false, message: "No forum post found." };
    }
  },
  updateFlagPost: async (post, id) => {
    const flag = post.flag;
    try {
      const returning = await db("posts")
        .where("id", id)
        .update({ flag })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  updateReplyFlaggedPost: async (post, id) => {
    const flag = post.flag;
    const reply = post.reply;
    try {
      const returning = await db("posts")
        .where("id", id)
        .update({ flag, reply })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  },
  deletePost: async id => {
    try {
      const returning = await db("posts")
        .where("id", id)
        .del();
      if (returning) {
        return {
          success: true,
          message: "Forum post has been deleted."
        };
      }
    } catch (err) {
      return { success: false, data: err };
    }
  }
};
