"use strict";

// Forum post table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export forum post table
module.exports = {
  getAllPost: async () => {
    try {
      const returning = await db("posts").where("remove", false);
      return { success: true, posts: returning };
    } catch (err) {
      return { success: false, message: "No forum post found." };
    }
  },
  getUserPost: async user_id => {
    try {
      const returning = await db("posts").where("user_id", user_id);
      return { success: true, posts: returning };
    } catch (err) {
      return { success: false, message: "No forum post found." };
    }
  },
  createPost: async (post, user_id) => {
    const category = post.category;
    const method_of_transportation = post.method_of_transportation;
    const title = post.title;
    const body = post.body;
    const post_img_url = post.post_img_url;
    const profile_img_url = post.profile_img_url;
    const first_name = post.first_name;
    const last_name = post.last_name;
    const email = post.email;
    const phone_number = post.phone_number;
    const verified = post.verified;
    try {
      const returning = await db("posts")
        .insert({
          user_id,
          category,
          method_of_transportation,
          title,
          body,
          post_img_url,
          profile_img_url,
          first_name,
          last_name,
          email,
          phone_number,
          verified
        })
        .returning("*");
      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  updatePost: async (post, id) => {
    const remove = post.remove;
    try {
      const returning = await db("posts")
        .where("id", id)
        .update({ remove })
        .returning("*");
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  }
};
