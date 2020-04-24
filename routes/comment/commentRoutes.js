"use strict";

// Libraries
const commentRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Comment = require("../../db/queries/comment/comment");
const { authenticateToken } = auth;

// GET all forum comments
commentRouter.get("/comments", async (req, res) => {
  const comments = await Comment.getAllComment();
  res.json(comments);
});

// POST forum comment
commentRouter.post("/comments", authenticateToken, async (req, res) => {
  const comment = {
    post_id: req.body.post_id,
    profile_img_url: req.body.profile_img_url,
    first_name: req.body.first_name,
    body: req.body.body
  };

  try {
    const comments = await Comment.createComment(comment, req.user.id);
    res.json(comments);
  } catch (err) {
    res.json(err);
  }
});

module.exports = commentRouter;
