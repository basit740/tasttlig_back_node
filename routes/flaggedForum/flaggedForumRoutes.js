"use strict";

// Libraries
const flaggedForumRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const FlaggedForum = require("../../db/queries/flagged_forum/flagged_forum");
const { authenticateToken } = auth;

// GET all flagged forums current
flaggedForumRouter.get("/flagged-forums/current", async (req, res) => {
  const flaggedForums = await FlaggedForum.getAllFlaggedForum();
  res.json(flaggedForums);
});

// GET all flagged forums archives
flaggedForumRouter.get("/flagged-forums/archives", async (req, res) => {
  const flaggedForums = await FlaggedForum.getAllArchivedFlaggedForum();
  res.json(flaggedForums);
});

// POST flagged forums
flaggedForumRouter.post(
  "/flagged-forums",
  authenticateToken,
  async (req, res) => {
    const flaggedForum = {
      post_id: req.body.post_id,
      flagged_email: req.body.flagged_email,
      flagged_profile_img_url: req.body.flagged_profile_img_url,
      flagged_first_name: req.body.flagged_first_name,
      flagged_body: req.body.flagged_body,
      post_profile_img_url: req.body.post_profile_img_url,
      post_first_name: req.body.post_first_name,
      post_title: req.body.post_title,
      post_body: req.body.post_body,
      post_img_url: req.body.post_img_url
    };

    try {
      const flaggedForums = await FlaggedForum.createFlaggedForum(
        flaggedForum,
        req.user.id
      );
      res.json(flaggedForums);
    } catch (err) {
      res.json(err);
    }
  }
);

// PUT flagged forum response from admin
flaggedForumRouter.put("/flagged-forums/:id", async (req, res) => {
  const flaggedForum = {
    flagged_email: req.body.flagged_email,
    flagged_first_name: req.body.flagged_first_name,
    flagged_body: req.body.flagged_body,
    post_title: req.body.post_title,
    reply: req.body.reply,
    archive: req.body.archive
  };

  try {
    const flaggedForums = await FlaggedForum.updateFlaggedForum(
      flaggedForum,
      req.params.id
    );
    res.json(flaggedForums);
  } catch (err) {
    console.log("Incoming Flagged Forum Response", err);
  }
});

module.exports = flaggedForumRouter;
