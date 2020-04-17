"use strict";

// Libraries
const feedbackRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Feedback = require("../../db/queries/feedback/feedback");
const { authenticateToken } = auth;

// GET all feedbacks
feedbackRouter.get("/feedbacks", async (req, res) => {
  const feedbacks = await Feedback.getAllFeedback();
  res.json(feedbacks);
});

// POST feedback
feedbackRouter.post("/feedbacks", authenticateToken, async (req, res) => {
  const feedback = {
    food_ad_number: req.body.food_ad_number,
    profile_img_url: req.body.profile_img_url,
    first_name: req.body.first_name,
    body: req.body.body
  };

  try {
    const feedbacks = await Feedback.createFeedback(feedback, req.user.id);
    res.json(feedbacks);
  } catch (err) {
    res.json(err);
  }
});

// PUT flag on feedback from user
feedbackRouter.put("/feedbacks/flag/:id", async (req, res) => {
  const feedback = {
    flag: req.body.flag
  };

  try {
    const feedbacks = await Feedback.updateFlagFeedback(
      feedback,
      req.params.id
    );
    res.json(feedbacks);
  } catch (err) {
    console.log("Incoming Feedback Flag", err);
  }
});

// PUT flagged reply on feedback from admin
feedbackRouter.put("/feedbacks/reply-flagged/:id", async (req, res) => {
  const feedback = {
    flag: req.body.flag,
    reply: req.body.reply
  };

  try {
    const feedbacks = await Feedback.updateReplyFlaggedFeedback(
      feedback,
      req.params.id
    );
    res.json(feedbacks);
  } catch (err) {
    console.log("Incoming Flagged Reply On Feedback", err);
  }
});

// DELETE flagged feedback from admin
feedbackRouter.delete("/feedbacks/:id", async (req, res) => {
  try {
    const returning = await Feedback.deleteFeedback(req.params.id);
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

module.exports = feedbackRouter;
