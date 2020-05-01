"use strict";

// Libraries
const postRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Post = require("../../db/queries/post/post");
const { authenticateToken } = auth;

// GET all forum posts
postRouter.get("/posts", async (req, res) => {
  const posts = await Post.getAllPost();
  res.json(posts);
});

// GET all forum posts based on user ID
postRouter.get("/posts/user", authenticateToken, async (req, res) => {
  const posts = await Post.getUserPost(req.user.id);
  res.json(posts);
});

// POST forum post
postRouter.post("/posts", authenticateToken, async (req, res) => {
  const post = {
    profile_img_url: req.body.profile_img_url,
    first_name: req.body.first_name,
    title: req.body.title,
    body: req.body.body,
    post_img_url: req.body.post_img_url
  };

  try {
    const posts = await Post.createPost(post, req.user.id);
    res.json(posts);
  } catch (err) {
    res.json(err);
  }
});

// PUT forum post response from admin
postRouter.put("/posts/:id", async (req, res) => {
  const post = {
    remove: req.body.remove
  };

  try {
    const posts = await Post.updatePost(post, req.params.id);
    res.json(posts);
  } catch (err) {
    console.log("Incoming Forum Post Response", err);
  }
});

module.exports = postRouter;
