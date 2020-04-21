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

// POST forum post
postRouter.post("/posts", authenticateToken, async (req, res) => {
  const post = {
    profile_img_url: req.body.profile_img_url,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    title: req.body.title,
    body: req.body.body
  };

  try {
    const posts = await Post.createPost(post, req.user.id);
    res.json(posts);
  } catch (err) {
    res.json(err);
  }
});

// PUT flag on forum post from user
postRouter.put("/posts/flag/:id", async (req, res) => {
  const post = {
    flag: req.body.flag
  };

  try {
    const posts = await Post.updateFlagPost(
      post,
      req.params.id
    );
    res.json(posts);
  } catch (err) {
    console.log("Incoming Forum Post Flag", err);
  }
});

// PUT flagged reply on forum post from admin
postRouter.put("/posts/reply-flagged/:id", async (req, res) => {
  const post = {
    flag: req.body.flag,
    reply: req.body.reply
  };

  try {
    const posts = await Post.updateReplyFlaggedPost(
      post,
      req.params.id
    );
    res.json(posts);
  } catch (err) {
    console.log("Incoming Flagged Reply On Forum Post", err);
  }
});

// DELETE flagged forum post from admin
postRouter.delete("/posts/:id", async (req, res) => {
  try {
    const returning = await Post.deletePost(req.params.id);
    res.send({
      success: true,
      message: "ok",
      response: returning
    });
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err
    });
  }
});

module.exports = postRouter;
